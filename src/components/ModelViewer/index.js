import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

function Model({ url }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} dispose={null} />;
}

export default function ModelViewer() {
    return (
        <Canvas style={{ height: '500px', width: '100%' }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[0, 10, 5]} intensity={1} />
            <Suspense fallback={null}>
                <Model url="file:///D:/Download/mouseclick.glb" />
                <OrbitControls />
            </Suspense>
        </Canvas>
    );
}
