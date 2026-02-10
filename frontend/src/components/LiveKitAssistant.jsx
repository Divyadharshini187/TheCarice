import React from 'react';
import {
    LiveKitRoom,
    BarVisualizer,
    RoomAudioRenderer,
    VoiceAssistantControlBar,
    useVoiceAssistant,
    useDataChannel,
} from '@livekit/components-react';
import '@livekit/components-styles';

const LiveKitAssistant = ({ token, serverUrl, onDisconnect, onDataReceived }) => {
    return (
        <LiveKitRoom
            token={token}
            serverUrl={serverUrl}
            connect={true}
            audio={true}
            video={false}
            onDisconnected={onDisconnect}
            data-lk-theme="default"
            style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', background: 'rgba(0,0,0,0.5)' }}
        >
            <AssistantInner onDataReceived={onDataReceived} />
            <RoomAudioRenderer />
        </LiveKitRoom>
    );
};

const AssistantInner = ({ onDataReceived }) => {
    const { state, audioTrack } = useVoiceAssistant();

    useDataChannel((msg) => {
        if (msg.payload) {
            try {
                const text = new TextDecoder().decode(msg.payload);
                const data = JSON.parse(text);
                if (data.type === 'order_update' && onDataReceived) {
                    onDataReceived(data);
                }
            } catch (e) {
                console.error("Error parsing data message:", e);
            }
        }
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px', padding: '20px' }}>
            <div style={{ width: '100%', height: '100px' }}>
                <BarVisualizer state={state} trackRef={audioTrack} />
            </div>
            <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: '500' }}>
                {state === 'idle' && 'Waiting for you to speak...'}
                {state === 'listening' && 'Listening...'}
                {state === 'thinking' && 'Thinking...'}
                {state === 'speaking' && 'Agent is speaking...'}
            </div>
            <VoiceAssistantControlBar />
        </div>
    );
};

export default LiveKitAssistant;
