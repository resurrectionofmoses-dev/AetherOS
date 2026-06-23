import threading
import queue
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, Optional


# ============================================================
# Enums
# ============================================================

class LifecycleState(Enum):
    CREATED = "created"
    RUNNING = "running"
    SLEEPING = "sleeping"
    FAILED = "failed"
    CLOSED = "closed"


class OperationCategory(Enum):
    PROCESS_CONTROL = "process_control"
    RESOURCE_LIFECYCLE = "resource_lifecycle"


class OperationIntent(Enum):
    START = "start"
    SLEEP = "sleep"
    WAKE = "wake"
    FAIL = "fail"
    CLOSE = "close"
    REMOVE = "remove"   # for resource_lifecycle only


# ============================================================
# Typed models
# ============================================================

@dataclass(frozen=True)
class Operation:
    category: OperationCategory
    intent: OperationIntent
    target: str
    correlation_id: str


@dataclass
class Request:
    action: str
    request_id: str
    operation: Optional[Operation] = None
    params: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Response:
    request_id: str
    status: str
    result: Optional[Any] = None
    reason: Optional[str] = None


@dataclass
class PendingRequest:
    event: threading.Event = field(default_factory=threading.Event)
    response: Optional[Response] = None


@dataclass
class TransitionResult:
    allowed: bool
    old_state: str
    new_state: Optional[str]
    reason: Optional[str] = None
    idempotent: bool = False


# ============================================================
# Exceptions
# ============================================================

class ValidationError(Exception):
    pass


# ============================================================
# Lifecycle state machine
# ============================================================

ALLOWED_TRANSITIONS = {
    LifecycleState.CREATED: {
        OperationIntent.START: LifecycleState.RUNNING,
        OperationIntent.CLOSE: LifecycleState.CLOSED,
        OperationIntent.FAIL: LifecycleState.FAILED,
    },
    LifecycleState.RUNNING: {
        OperationIntent.SLEEP: LifecycleState.SLEEPING,
        OperationIntent.CLOSE: LifecycleState.CLOSED,
        OperationIntent.FAIL: LifecycleState.FAILED,
    },
    LifecycleState.SLEEPING: {
        OperationIntent.WAKE: LifecycleState.RUNNING,
        OperationIntent.CLOSE: LifecycleState.CLOSED,
        OperationIntent.FAIL: LifecycleState.FAILED,
    },
    LifecycleState.FAILED: {
        OperationIntent.START: LifecycleState.RUNNING,   # optional recovery
        OperationIntent.CLOSE: LifecycleState.CLOSED,
    },
    LifecycleState.CLOSED: {}
}

IDEMPOTENT_TRANSITIONS = {
    (LifecycleState.SLEEPING, OperationIntent.SLEEP),
    (LifecycleState.CLOSED, OperationIntent.CLOSE),
}


@dataclass
class LifecycleObject:
    object_id: str
    state: LifecycleState = LifecycleState.CREATED

    def can_apply(self, intent: OperationIntent) -> bool:
        return intent in ALLOWED_TRANSITIONS[self.state]

    def apply(self, intent: OperationIntent) -> LifecycleState:
        self.state = ALLOWED_TRANSITIONS[self.state][intent]
        return self.state


def apply_transition(obj: LifecycleObject, intent: OperationIntent) -> TransitionResult:
    old_state = obj.state

    if (old_state, intent) in IDEMPOTENT_TRANSITIONS:
        return TransitionResult(
            allowed=True,
            old_state=old_state.value,
            new_state=old_state.value,
            idempotent=True
        )

    if not obj.can_apply(intent):
        return TransitionResult(
            allowed=False,
            old_state=old_state.value,
            new_state=None,
            reason=f"Cannot apply '{intent.value}' while in state '{old_state.value}'"
        )

    new_state = obj.apply(intent)
    return TransitionResult(
        allowed=True,
        old_state=old_state.value,
        new_state=new_state.value
    )


# ============================================================
# Lifecycle registry
# ============================================================

class LifecycleRegistry:
    def __init__(self):
        self._lock = threading.Lock()
        self._objects: Dict[str, LifecycleObject] = {}

    def get_or_create(self, object_id: str) -> LifecycleObject:
        with self._lock:
            if object_id not in self._objects:
                self._objects[object_id] = LifecycleObject(object_id=object_id)
            return self._objects[object_id]

    def get_state(self, object_id: str) -> Optional[LifecycleState]:
        with self._lock:
            obj = self._objects.get(object_id)
            return obj.state if obj else None

    def remove(self, object_id: str) -> bool:
        with self._lock:
            if object_id in self._objects:
                del self._objects[object_id]
                return True
            return False


# ============================================================
# Policy
# ============================================================

class Policy:
    def __init__(self):
        self.allowed_actions = {
            "search_docs": self._validate_search_docs,
            "read_note": self._validate_read_note,
            "system_operation": self._validate_system_operation,
        }

        self.allowed_process_intents = {
            OperationIntent.START,
            OperationIntent.SLEEP,
            OperationIntent.WAKE,
            OperationIntent.FAIL,
            OperationIntent.CLOSE,
        }

        self.allowed_resource_intents = {
            OperationIntent.REMOVE,
            OperationIntent.CLOSE,
        }

        self.allowed_target_prefixes = {
            OperationCategory.PROCESS_CONTROL: ["job-", "task-", "worker-"],
            OperationCategory.RESOURCE_LIFECYCLE: ["cache-", "temp-", "session-"],
        }

    def validate(self, req: Request) -> None:
        validator = self.allowed_actions.get(req.action)
        if not validator:
            raise ValidationError(f"Action not allowed: {req.action}")
        validator(req)

    def _validate_search_docs(self, req: Request) -> None:
        query = req.params.get("query")
        if not isinstance(query, str) or not query.strip():
            raise ValidationError("Invalid query")
        if len(query) > 200:
            raise ValidationError("Query too long")

    def _validate_read_note(self, req: Request) -> None:
        note_id = req.params.get("note_id")
        if not isinstance(note_id, str) or not note_id.isalnum():
            raise ValidationError("Invalid note_id")

    def _validate_system_operation(self, req: Request) -> None:
        op = req.operation
        if op is None:
            raise ValidationError("Missing operation")

        if not isinstance(op.target, str) or not op.target.strip():
            raise ValidationError("Invalid operation target")

        if not isinstance(op.correlation_id, str) or not op.correlation_id.strip():
            raise ValidationError("Invalid correlation_id")

        if len(op.correlation_id) > 100:
            raise ValidationError("correlation_id too long")

        allowed_prefixes = self.allowed_target_prefixes.get(op.category, [])
        if not any(op.target.startswith(prefix) for prefix in allowed_prefixes):
            raise ValidationError(f"Invalid target for category {op.category.value}")

        if op.category == OperationCategory.PROCESS_CONTROL:
            if op.intent not in self.allowed_process_intents:
                raise ValidationError(
                    f"Intent '{op.intent.value}' not allowed for {op.category.value}"
                )

        elif op.category == OperationCategory.RESOURCE_LIFECYCLE:
            if op.intent not in self.allowed_resource_intents:
                raise ValidationError(
                    f"Intent '{op.intent.value}' not allowed for {op.category.value}"
                )


# ============================================================
# Executor
# ============================================================

class RestrictedExecutor:
    def __init__(self, lifecycle_registry: LifecycleRegistry):
        self.lifecycle_registry = lifecycle_registry

    def execute(self, req: Request) -> Any:
        if req.action == "search_docs":
            return self._search_docs(req.params)

        if req.action == "read_note":
            return self._read_note(req.params)

        if req.action == "system_operation":
            return self._system_operation(req.operation)

        raise RuntimeError(f"Unhandled action: {req.action}")

    def _search_docs(self, params: Dict[str, Any]) -> Dict[str, Any]:
        query = params["query"]
        time.sleep(0.2)
        return {
            "status": "ok",
            "action": "search_docs",
            "results": [f"Matched document for: {query}"]
        }

    def _read_note(self, params: Dict[str, Any]) -> Dict[str, Any]:
        note_id = params["note_id"]
        time.sleep(0.1)
        return {
            "status": "ok",
            "action": "read_note",
            "note_id": note_id,
            "content": "Example note content"
        }

    def _system_operation(self, op: Operation) -> Dict[str, Any]:
        if op.category == OperationCategory.PROCESS_CONTROL:
            obj = self.lifecycle_registry.get_or_create(op.target)
            result = apply_transition(obj, op.intent)

            if not result.allowed:
                return {
                    "status": "rejected",
                    "action": "system_operation",
                    "operation": self._serialize_operation(op),
                    "reason": result.reason,
                    "old_state": result.old_state,
                }

            time.sleep(0.15)

            return {
                "status": "ok",
                "action": "system_operation",
                "operation": self._serialize_operation(op),
                "old_state": result.old_state,
                "new_state": result.new_state,
                "idempotent": result.idempotent,
                "message": f"{op.intent.value} applied to {op.target}"
            }

        if op.category == OperationCategory.RESOURCE_LIFECYCLE:
            if op.intent == OperationIntent.REMOVE:
                removed = self.lifecycle_registry.remove(op.target)
                time.sleep(0.1)
                return {
                    "status": "ok" if removed else "rejected",
                    "action": "system_operation",
                    "operation": self._serialize_operation(op),
                    "message": f"Removed resource {op.target}" if removed else f"Resource not found: {op.target}"
                }

            if op.intent == OperationIntent.CLOSE:
                removed = self.lifecycle_registry.remove(op.target)
                time.sleep(0.1)
                return {
                    "status": "ok" if removed else "rejected",
                    "action": "system_operation",
                    "operation": self._serialize_operation(op),
                    "message": f"Closed resource {op.target}" if removed else f"Resource not found: {op.target}"
                }

        raise RuntimeError("Unhandled system operation")

    @staticmethod
    def _serialize_operation(op: Operation) -> Dict[str, str]:
        return {
            "category": op.category.value,
            "intent": op.intent.value,
            "target": op.target,
            "correlation_id": op.correlation_id,
        }


# ============================================================
# Threaded gateway
# ============================================================

class ThreadedAgentGateway:
    def __init__(self, worker_count: int = 2):
        self.policy = Policy()
        self.lifecycle_registry = LifecycleRegistry()
        self.executor = RestrictedExecutor(self.lifecycle_registry)

        self.request_queue: queue.Queue[Request] = queue.Queue()
        self.stop_event = threading.Event()

        self.pending: Dict[str, PendingRequest] = {}
        self.pending_lock = threading.Lock()
        self.log_lock = threading.Lock()

        self.workers = []
        for i in range(worker_count):
            t = threading.Thread(
                target=self._worker_loop,
                name=f"gateway-worker-{i}",
                daemon=True
            )
            t.start()
            self.workers.append(t)

    def submit(self, req: Request) -> PendingRequest:
        pending = PendingRequest()
        with self.pending_lock:
            self.pending[req.request_id] = pending
        self.request_queue.put(req)
        return pending

    def handle_sync(self, req: Request, timeout: float = 5.0) -> Response:
        pending = self.submit(req)
        completed = pending.event.wait(timeout=timeout)

        if not completed:
            return Response(
                request_id=req.request_id,
                status="rejected",
                reason="Timed out waiting for response"
            )
        return pending.response

    def shutdown(self) -> None:
        self.stop_event.set()

        for i in range(len(self.workers)):
            self.request_queue.put(
                Request(
                    action="__shutdown__",
                    request_id=f"shutdown-{i}"
                )
            )

        for t in self.workers:
            t.join(timeout=1.0)

    def _worker_loop(self) -> None:
        while not self.stop_event.is_set():
            req = self.request_queue.get()
            try:
                if req.action == "__shutdown__":
                    return

                response = self._process_request(req)

                with self.pending_lock:
                    pending = self.pending.get(req.request_id)

                if pending:
                    pending.response = response
                    pending.event.set()

            finally:
                self.request_queue.task_done()

    def _process_request(self, req: Request) -> Response:
        try:
            self.policy.validate(req)
            result = self.executor.execute(req)

            self._log({
                "request_id": req.request_id,
                "action": req.action,
                "operation": self._safe_operation_log(req.operation),
                "params": req.params,
                "outcome": result.get("status", "ok") if isinstance(result, dict) else "ok"
            })

            if isinstance(result, dict) and result.get("status") == "rejected":
                return Response(
                    request_id=req.request_id,
                    status="rejected",
                    reason=result.get("reason", result.get("message", "Rejected")),
                    result=result
                )

            return Response(
                request_id=req.request_id,
                status="ok",
                result=result
            )

        except ValidationError as e:
            self._log({
                "request_id": req.request_id,
                "action": req.action,
                "operation": self._safe_operation_log(req.operation),
                "params": req.params,
                "outcome": f"rejected: {e}"
            })

            return Response(
                request_id=req.request_id,
                status="rejected",
                reason=str(e)
            )

        except Exception as e:
            self._log({
                "request_id": req.request_id,
                "action": req.action,
                "operation": self._safe_operation_log(req.operation),
                "params": req.params,
                "outcome": f"error: {e}"
            })

            return Response(
                request_id=req.request_id,
                status="rejected",
                reason="Internal execution error"
            )

    def _safe_operation_log(self, op: Optional[Operation]) -> Optional[Dict[str, str]]:
        if op is None:
            return None
        return {
            "category": op.category.value,
            "intent": op.intent.value,
            "target": op.target,
            "correlation_id": op.correlation_id,
        }

    def _log(self, message: Any) -> None:
        with self.log_lock:
            print(message)


# ============================================================
# Example usage
# ============================================================

if __name__ == "__main__":
    gateway = ThreadedAgentGateway(worker_count=3)

    try:
        requests = [
            Request(
                action="system_operation",
                request_id="req-001",
                operation=Operation(
                    category=OperationCategory.PROCESS_CONTROL,
                    intent=OperationIntent.START,
                    target="job-77",
                    correlation_id="corr-1001"
                )
            ),
            Request(
                action="system_operation",
                request_id="req-002",
                operation=Operation(
                    category=OperationCategory.PROCESS_CONTROL,
                    intent=OperationIntent.SLEEP,
                    target="job-77",
                    correlation_id="corr-1002"
                )
            ),
            Request(
                action="system_operation",
                request_id="req-003",
                operation=Operation(
                    category=OperationCategory.PROCESS_CONTROL,
                    intent=OperationIntent.WAKE,
                    target="job-77",
                    correlation_id="corr-1003"
                )
            ),
            Request(
                action="system_operation",
                request_id="req-004",
                operation=Operation(
                    category=OperationCategory.PROCESS_CONTROL,
                    intent=OperationIntent.WAKE,
                    target="job-77",
                    correlation_id="corr-1004"
                )
            ),
            Request(
                action="system_operation",
                request_id="req-005",
                operation=Operation(
                    category=OperationCategory.PROCESS_CONTROL,
                    intent=OperationIntent.CLOSE,
                    target="job-77",
                    correlation_id="corr-1005"
                )
            ),
            Request(
                action="system_operation",
                request_id="req-006",
                operation=Operation(
                    category=OperationCategory.PROCESS_CONTROL,
                    intent=OperationIntent.WAKE,
                    target="job-77",
                    correlation_id="corr-1006"
                )
            ),
            Request(
                action="search_docs",
                request_id="req-007",
                params={"query": "climate policy"}
            ),
        ]

        pendings = [gateway.submit(req) for req in requests]

        for req, pending in zip(requests, pendings):
            pending.event.wait(timeout=2.0)
            print(f"{req.request_id} -> {pending.response}")

    finally:
        gateway.shutdown()
