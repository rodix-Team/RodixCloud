'use client';

import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float, Sparkles } from '@react-three/drei';
import { Model as BeeModel } from './BeeModel';
import * as THREE from 'three';

// Interactive Bee with hover effects
function InteractiveBee({ isHovered, isActive }) {
    const groupRef = useRef();
    const [targetScale, setTargetScale] = useState(3);
    const [targetRotation, setTargetRotation] = useState(0);

    useEffect(() => {
        setTargetScale(isHovered ? 3.3 : 3);
    }, [isHovered]);

    useEffect(() => {
        // Turn to the side (approx 45 degrees + slight tilt) when active
        setTargetRotation(isActive ? -Math.PI / 4 : 0);
    }, [isActive]);

    useFrame((state) => {
        if (groupRef.current) {
            // Smooth scale transition
            groupRef.current.scale.lerp(
                new THREE.Vector3(targetScale, targetScale, targetScale),
                0.1
            );

            // Smooth rotation transition (turning head/body)
            groupRef.current.rotation.y = THREE.MathUtils.lerp(
                groupRef.current.rotation.y,
                targetRotation,
                0.1
            );

            // Add subtle floating bobbing
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            <BeeModel scale={1} position={[0, 0, 0]} />
        </group>
    );
}

// Glow effect component
function GlowEffect({ isHovered }) {
    const glowRef = useRef();

    useFrame((state) => {
        if (glowRef.current) {
            // Pulsing glow
            const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.8;
            const intensity = isHovered ? 1.5 : 1;
            glowRef.current.material.opacity = pulse * 0.3 * intensity;
        }
    });

    return (
        <mesh ref={glowRef} scale={[4, 4, 4]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial
                color="#F4A300"
                transparent
                opacity={0.2}
                side={THREE.BackSide}
            />
        </mesh>
    );
}

export default function Bee3D({ onClick, className, isMuted = false, isActive = false }) {
    const [isHovered, setIsHovered] = useState(false);
    const audioRef = useRef(null);

    // Buzzing sound effect
    useEffect(() => {
        // Create buzzing sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // Buzz frequency

        // Add vibrato for realistic buzzing
        const vibrato = audioContext.createOscillator();
        const vibratoGain = audioContext.createGain();
        vibrato.frequency.setValueAtTime(30, audioContext.currentTime);
        vibratoGain.gain.setValueAtTime(20, audioContext.currentTime);
        vibrato.connect(vibratoGain);
        vibratoGain.connect(oscillator.frequency);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Very low volume
        gainNode.gain.setValueAtTime(isMuted ? 0 : 0.02, audioContext.currentTime);

        audioRef.current = { oscillator, vibrato, gainNode, audioContext };

        // Start sound
        oscillator.start();
        vibrato.start();

        return () => {
            oscillator.stop();
            vibrato.stop();
            audioContext.close();
        };
    }, []);

    // Update volume on hover/mute
    useEffect(() => {
        if (audioRef.current) {
            const targetVolume = isMuted ? 0 : isHovered ? 0.04 : 0.02;
            audioRef.current.gainNode.gain.setTargetAtTime(
                targetVolume,
                audioRef.current.audioContext.currentTime,
                0.1
            );
        }
    }, [isHovered, isMuted]);

    return (
        <div
            className={className}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                width: '100%',
                height: '100%',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'transform 0.3s ease'
            }}
        >
            <Canvas camera={{ position: [0, 0, 6], fov: 40 }}>
                <ambientLight intensity={0.7} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />



                <Suspense fallback={null}>
                    {/* Honey particles */}
                    <Sparkles
                        count={30}
                        scale={5}
                        size={3}
                        speed={0.3}
                        opacity={0.5}
                        color="#F4A300"
                    />



                    {/* Floating bee */}
                    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                        <InteractiveBee isHovered={isHovered} isActive={isActive} />
                    </Float>

                    <Environment preset="city" />
                    <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
                </Suspense>

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    enableRotate={true}
                    autoRotate={false}
                />
            </Canvas>
        </div>
    );
}
