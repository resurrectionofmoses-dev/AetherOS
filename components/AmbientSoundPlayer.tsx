
import React, { useEffect, useRef } from 'react';
import type { SystemStatus, SystemState, SoundscapeType } from '../types';

interface AmbientSoundPlayerProps {
  enabled: boolean;
  status: SystemStatus;
  isHalted: boolean;
  soundscape: SoundscapeType;
}

export const AmbientSoundPlayer: React.FC<AmbientSoundPlayerProps> = ({ enabled, status, isHalted, soundscape }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<any[]>([]); // Store active nodes for cleanup
  
  const getWorstState = (status: SystemStatus): SystemState => {
    const states = Object.values(status);
    if (states.includes('Error')) return 'Error';
    if (states.includes('Warning')) return 'Warning';
    return 'OK';
  };

  const cleanup = () => {
    nodesRef.current.forEach(node => {
      try {
        if (node.stop) node.stop();
        node.disconnect();
      } catch (e) {}
    });
    nodesRef.current = [];
  };

  // Setup Soundscape
  useEffect(() => {
    if (!enabled) {
        cleanup();
        return;
    }

    if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
        const main = audioCtxRef.current.createGain();
        main.connect(audioCtxRef.current.destination);
        masterGainRef.current = main;
    }

    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;

    cleanup();

    if (soundscape === 'VOID') {
        // VOID: Ethereal Sine Drones + LFO Pulse
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = 60; // Deep hum base
        
        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.value = 120; // Harmonic
        
        const gain1 = ctx.createGain();
        gain1.gain.value = 0.1;
        
        // LFO for pulsing
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.1; 
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.05;
        
        lfo.connect(lfoGain);
        lfoGain.connect(gain1.gain);
        
        osc1.connect(gain1);
        osc2.connect(gain1);
        gain1.connect(master);
        
        osc1.start();
        osc2.start();
        lfo.start();
        
        // Store reference to LFO for updates
        nodesRef.current = [osc1, osc2, lfo, gain1, lfoGain];

    } else if (soundscape === 'REACTOR') {
        // REACTOR: Industrial Rumble (Sawtooth + Lowpass)
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = 40;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 100;
        filter.Q.value = 1;
        
        const gain = ctx.createGain();
        gain.gain.value = 0.15;
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(master);
        
        osc.start();
        nodesRef.current = [osc, filter, gain];

    } else if (soundscape === 'TERRA') {
        // TERRA: Nature/Stadium Ambience (Noise + Bandpass)
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 500;
        
        const gain = ctx.createGain();
        gain.gain.value = 0.08;
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(master);
        noise.start();
        
        // Add subtle animal synth
        const chirp = ctx.createOscillator();
        chirp.type = 'sine';
        chirp.frequency.value = 2000;
        const chirpGain = ctx.createGain();
        chirpGain.gain.value = 0; // modulated later
        chirp.connect(chirpGain);
        chirpGain.connect(master);
        chirp.start();

        nodesRef.current = [noise, filter, gain, chirp, chirpGain];
    }

    return () => {
        // Cleanup on unmount handled by next useEffect or component unmount logic if moved
    };
  }, [enabled, soundscape]);

  // Dynamic Updates based on Status
  useEffect(() => {
      if (!audioCtxRef.current || !enabled) return;
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const worstState = getWorstState(status);

      // Handle Halt
      if (masterGainRef.current) {
          masterGainRef.current.gain.setTargetAtTime(isHalted ? 0 : 0.1, now, 0.5);
      }

      if (soundscape === 'VOID') {
          // LFO is index 2, LFO Gain index 4
          const lfo = nodesRef.current[2] as OscillatorNode;
          const lfoGain = nodesRef.current[4] as GainNode;
          
          if (lfo && lfoGain) {
              if (worstState === 'Error') {
                  lfo.frequency.setTargetAtTime(8, now, 2); // Fast, anxious pulse
                  lfoGain.gain.setTargetAtTime(0.5, now, 1);
              } else if (worstState === 'Warning') {
                  lfo.frequency.setTargetAtTime(2, now, 2); // Noticeable pulse
                  lfoGain.gain.setTargetAtTime(0.2, now, 1);
              } else {
                  lfo.frequency.setTargetAtTime(0.1, now, 5); // Deep, slow breath
                  lfoGain.gain.setTargetAtTime(0.05, now, 2);
              }
          }
      } else if (soundscape === 'REACTOR') {
          // Osc index 0, Filter index 1
          const osc = nodesRef.current[0] as OscillatorNode;
          const filter = nodesRef.current[1] as BiquadFilterNode;

          if (osc && filter) {
              if (worstState === 'Error') {
                  filter.frequency.setTargetAtTime(1000, now, 0.5); // Open valve/scream
                  filter.Q.setTargetAtTime(10, now, 0.5); // Resonant screech
                  osc.frequency.setTargetAtTime(100, now, 0.2); // Engine spin up
              } else if (worstState === 'Warning') {
                  filter.frequency.setTargetAtTime(400, now, 1); // Pressure building
                  filter.Q.setTargetAtTime(5, now, 1);
              } else {
                  filter.frequency.setTargetAtTime(100, now, 2); // Low rumble
                  filter.Q.setTargetAtTime(1, now, 1);
                  osc.frequency.setTargetAtTime(40, now, 2);
              }
          }
      } else if (soundscape === 'TERRA') {
          // Filter index 1, ChirpGain index 4
          const filter = nodesRef.current[1] as BiquadFilterNode;
          const chirpGain = nodesRef.current[4] as GainNode;

          if (filter && chirpGain) {
              if (worstState === 'Error') {
                   // Chaos in the barn
                   filter.frequency.setTargetAtTime(200, now, 0.5); // Muffled panic
                   // Random chirps simulated by LFO in separate loop or simplistic modulation here?
                   // For simplicity, just increase background noise pitch slightly
              } else {
                   filter.frequency.setTargetAtTime(500, now, 2); // Normal breeze
              }
          }
      }

  }, [status, isHalted, soundscape, enabled]);

  return null; 
};
