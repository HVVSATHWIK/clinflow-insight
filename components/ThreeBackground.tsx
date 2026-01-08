import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Setup
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // Match Slate-50/Slate-100
    // Very subtle fog
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.002);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // Data Points (System Nodes Visualization)
    const geometry = new THREE.BufferGeometry();
    const count = 150; // Significantly reduced from 400 for cleaner look
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const color1 = new THREE.Color(0xcbd5e1); // Light Slate
    const color2 = new THREE.Color(0x94a3b8); // Darker Slate

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 160;     // x
      positions[i + 1] = (Math.random() - 0.5) * 110; // y
      positions[i + 2] = (Math.random() - 0.5) * 60;  // z

      const mixedColor = Math.random() > 0.5 ? color1 : color2;
      colors[i] = mixedColor.r;
      colors[i + 1] = mixedColor.g;
      colors[i + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.4, // Smaller particles
      vertexColors: true,
      transparent: true,
      opacity: 0.2, // Very subtle opacity
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // System Liveness Loop: Slow, purposeful rotation to indicate active monitoring
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      particles.rotation.y += 0.0001; // Extremely slow rotation
      particles.rotation.x += 0.00005;
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  );
};