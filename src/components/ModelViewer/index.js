import '@google/model-viewer';

export default function ModelViewer({ model }) {
    return (
        <model-viewer
            src={model}
            alt="A 3D model"
            auto-rotate
            camera-controls
            style={{ width: '100%', height: '500px' }}
        ></model-viewer>
    );
}
