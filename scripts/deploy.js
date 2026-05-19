async function main() {
  const BiometricRegistry = await ethers.getContractFactory("BiometricRegistry");
  const registry = await BiometricRegistry.deploy();

  await registry.waitForDeployment();

  console.log("BiometricRegistry deployed to:", await registry.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
