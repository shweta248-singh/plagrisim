import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Effects } from '@react-three/drei';
import { UnrealBloomPass } from 'three-stdlib';
import * as THREE from 'three';

extend({ UnrealBloomPass });

const ParticleSwarm = () => {
  const meshRef = useRef();
  const count = 20000;
  const speedMult = 1;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const pColor = useMemo(() => new THREE.Color(), []);
  const color = pColor; // Alias for user code compatibility
  
  const positions = useMemo(() => {
     const pos = [];
     for(let i=0; i<count; i++) pos.push(new THREE.Vector3((Math.random()-0.5)*100, (Math.random()-0.5)*100, (Math.random()-0.5)*100));
     return pos;
  }, []);

  // Material & Geom
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff }), []);
  const geometry = useMemo(() => new THREE.TetrahedronGeometry(0.25), []);

  const PARAMS = useMemo(() => ({"drift":0.3,"snap":2,"radius":18}), []);
  const addControl = (id, l, min, max, val) => {
      return PARAMS[id] !== undefined ? PARAMS[id] : val;
  };
  const setInfo = () => {};
  const annotate = () => {};

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() * speedMult;
    const THREE_LIB = THREE;

    if(material.uniforms && material.uniforms.uTime) {
         material.uniforms.uTime.value = time;
    }

    for (let i = 0; i < count; i++) {
        // USER CODE START
        const driftSpeed   = addControl("drift",  "Ambient Drift Speed",   0.0,  2.0,  0.3);
        const snapForce    = addControl("snap",   "Attention Snap Force",  0.0,  5.0,  2.0);
        const clusterRadius = addControl("radius","Cluster Radius",        5.0, 50.0, 18.0);
        
        if (i === 0) {
          setInfo(
            "Latent Space — Attention Mechanism",
            "A dormant neural network void. Periodic attention heads activate and pull nearby particles into white-hot neon clusters before releasing them back into the deep."
          );
          annotate("vc", new THREE.Vector3(0, 0, 0),       "Void Core");
          annotate("h0", new THREE.Vector3(30,  20, -15),  "Head 0");
          annotate("h1", new THREE.Vector3(-25, -30, 20),  "Head 1");
          annotate("h2", new THREE.Vector3(10,  35,  30),  "Head 2");
          annotate("h3", new THREE.Vector3(-35, 15, -25),  "Head 3");
        }
        
        // Fibonacci sphere — stable, uniform, zero GC
        const fi    = (i + 0.5) / count;
        const phi   = Math.acos(1.0 - 2.0 * fi);
        const theta = 6.28318530718 * i * 0.6180339887;
        const R     = 80.0;
        const bx    = R * Math.sin(phi) * Math.cos(theta);
        const by    = R * Math.cos(phi);
        const bz    = R * Math.sin(phi) * Math.sin(theta);
        
        // Ambient drift — layered slow sines, unique per particle
        const fd  = i * 0.00031;
        const t   = time;
        const ds  = driftSpeed;
        const dx  = Math.sin(fd * 7.3  + t * ds * 0.40       ) * 4.5;
        const dy  = Math.cos(fd * 5.1  + t * ds * 0.35       ) * 4.5;
        const dz  = Math.sin(fd * 9.7  + t * ds * 0.45 + 1.2 ) * 4.5;
        
        // 4 attention node positions (inside sphere, static)
        const n0x = 30.0;  const n0y =  20.0; const n0z = -15.0;
        const n1x = -25.0; const n1y = -30.0; const n1z =  20.0;
        const n2x =  10.0; const n2y =  35.0; const n2z =  30.0;
        const n3x = -35.0; const n3y =  15.0; const n3z = -25.0;
        
        // Periodic activations — cubed for sharp violent snap rise
        const r0 = Math.max(0.0, Math.sin(t * 0.41         )); const a0 = r0 * r0 * r0;
        const r1 = Math.max(0.0, Math.sin(t * 0.29 + 2.1   )); const a1 = r1 * r1 * r1;
        const r2 = Math.max(0.0, Math.sin(t * 0.53 + 4.2   )); const a2 = r2 * r2 * r2;
        const r3 = Math.max(0.0, Math.sin(t * 0.37 + 1.0   )); const a3 = r3 * r3 * r3;
        
        const cr = Math.max(1.0, clusterRadius);
        
        // Per-node: radial gate * activation = pull weight
        const d0x = n0x - bx; const d0y = n0y - by; const d0z = n0z - bz;
        const pull0 = Math.max(0.0, 1.0 - Math.sqrt(d0x*d0x + d0y*d0y + d0z*d0z + 0.01) / cr) * a0;
        
        const d1x = n1x - bx; const d1y = n1y - by; const d1z = n1z - bz;
        const pull1 = Math.max(0.0, 1.0 - Math.sqrt(d1x*d1x + d1y*d1y + d1z*d1z + 0.01) / cr) * a1;
        
        const d2x = n2x - bx; const d2y = n2y - by; const d2z = n2z - bz;
        const pull2 = Math.max(0.0, 1.0 - Math.sqrt(d2x*d2x + d2y*d2y + d2z*d2z + 0.01) / cr) * a2;
        
        const d3x = n3x - bx; const d3y = n3y - by; const d3z = n3z - bz;
        const pull3 = Math.max(0.0, 1.0 - Math.sqrt(d3x*d3x + d3y*d3y + d3z*d3z + 0.01) / cr) * a3;
        
        // Weighted blend of all active node targets, gated by snapForce
        const wt         = pull0 + pull1 + pull2 + pull3 + 0.0001;
        const totalPull  = Math.min(1.0, (wt / 0.0001) > 1.0 ? wt * snapForce * 0.25 : 0.0);
        const snapX      = (pull0*n0x + pull1*n1x + pull2*n2x + pull3*n3x) / wt;
        const snapY      = (pull0*n0y + pull1*n1y + pull2*n2y + pull3*n3y) / wt;
        const snapZ      = (pull0*n0z + pull1*n1z + pull2*n2z + pull3*n3z) / wt;
        
        // Final position: lerp drifted base toward dominant snap target
        target.set(
          bx + dx + (snapX - bx - dx) * totalPull,
          by + dy + (snapY - by - dy) * totalPull,
          bz + dz + (snapZ - bz - dz) * totalPull
        );
        
        // Color — neon hue per particle slot
        const slot  = i % 3;
        const neonH = slot === 0 ? 0.50 : (slot === 1 ? 0.10 : 0.33);
        // L: 0.1 (void grey) → 0.5 (neon) → 1.0 (white flash) as pull grows
        // At L=1.0, HSL is pure white regardless of H/S — flash is automatic
        const lit   = 0.10 + totalPull * 0.90;
        const sat   = totalPull > 0.015 ? 1.0 : 0.0;
        
        color.setHSL(neonH, sat, lit);
        // USER CODE END

        positions[i].lerp(target, 0.1);
        dummy.position.copy(positions[i]);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        meshRef.current.setColorAt(i, pColor);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]} />
  );
};

export default function ParticleBackground() {
  return (
    <div style={{ width: '100%', height: '100%', background: 'transparent', pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 100], fov: 60 }} dpr={[1, 2]}>
        <fog attach="fog" args={['#000000', 0.01]} />
        <ParticleSwarm />
        <OrbitControls autoRotate={true} enableZoom={false} enablePan={false} enableRotate={false} />
        <Effects disableGamma>
            <unrealBloomPass threshold={0} strength={1.8} radius={0.4} />
        </Effects>
      </Canvas>
    </div>
  );
}
