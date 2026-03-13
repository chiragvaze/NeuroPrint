import { useEffect, useRef, useState } from "react";
import { collectBehaviorFeatures } from "../services/behaviorService";

const average = (values) => {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const variance = (values) => {
  if (!values.length) return 0;
  const avg = average(values);
  return values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;
};

function BehaviorCapture({
  userId,
  autoSend = true,
  submitLabel = "Stop and Send",
  onCaptureComplete
}) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [status, setStatus] = useState("");
  const [features, setFeatures] = useState(null);

  const sessionEventsRef = useRef([]);
  const keyDownMapRef = useRef(new Map());
  const lastKeyDownTimeRef = useRef(null);
  const keyHoldTimesRef = useRef([]);
  const keyDelaysRef = useRef([]);

  const lastMousePointRef = useRef(null);
  const lastMouseSpeedRef = useRef(null);
  const mouseSpeedsRef = useRef([]);
  const mouseAccelerationsRef = useRef([]);
  const movementJitterSamplesRef = useRef([]);

  const mouseDownTimeRef = useRef(null);
  const clickLatenciesRef = useRef([]);
  const keyPressCountRef = useRef(0);
  const sessionStartRef = useRef(null);

  useEffect(() => {
    if (!isCapturing) {
      return undefined;
    }

    sessionStartRef.current = Date.now();

    const onKeyDown = (event) => {
      const timestamp = Date.now();

      if (!keyDownMapRef.current.has(event.code)) {
        keyDownMapRef.current.set(event.code, timestamp);
        keyPressCountRef.current += 1;
      }

      if (lastKeyDownTimeRef.current) {
        keyDelaysRef.current.push(timestamp - lastKeyDownTimeRef.current);
      }

      lastKeyDownTimeRef.current = timestamp;

      sessionEventsRef.current.push({
        type: "keydown",
        key: event.key,
        code: event.code,
        timestamp
      });
    };

    const onKeyUp = (event) => {
      const timestamp = Date.now();
      const keydownTimestamp = keyDownMapRef.current.get(event.code);

      if (keydownTimestamp) {
        keyHoldTimesRef.current.push(timestamp - keydownTimestamp);
        keyDownMapRef.current.delete(event.code);
      }

      sessionEventsRef.current.push({
        type: "keyup",
        key: event.key,
        code: event.code,
        timestamp
      });
    };

    const onMouseMove = (event) => {
      const timestamp = Date.now();
      const point = { x: event.clientX, y: event.clientY, timestamp };

      if (lastMousePointRef.current) {
        const dx = point.x - lastMousePointRef.current.x;
        const dy = point.y - lastMousePointRef.current.y;
        const dt = Math.max(1, point.timestamp - lastMousePointRef.current.timestamp);
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed = distance / dt;

        mouseSpeedsRef.current.push(speed);

        if (lastMouseSpeedRef.current !== null) {
          const acceleration = Math.abs(speed - lastMouseSpeedRef.current) / dt;
          mouseAccelerationsRef.current.push(acceleration);
          movementJitterSamplesRef.current.push(Math.abs(speed - lastMouseSpeedRef.current));
        }

        lastMouseSpeedRef.current = speed;
      }

      lastMousePointRef.current = point;

      sessionEventsRef.current.push({
        type: "mousemove",
        x: point.x,
        y: point.y,
        timestamp
      });
    };

    const onMouseDown = (event) => {
      const timestamp = Date.now();
      mouseDownTimeRef.current = timestamp;

      sessionEventsRef.current.push({
        type: "mousedown",
        x: event.clientX,
        y: event.clientY,
        timestamp
      });
    };

    const onMouseUp = (event) => {
      const timestamp = Date.now();

      if (mouseDownTimeRef.current) {
        clickLatenciesRef.current.push(timestamp - mouseDownTimeRef.current);
      }

      sessionEventsRef.current.push({
        type: "mouseup",
        x: event.clientX,
        y: event.clientY,
        timestamp
      });

      mouseDownTimeRef.current = null;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isCapturing]);

  const resetSession = () => {
    sessionEventsRef.current = [];
    keyDownMapRef.current = new Map();
    lastKeyDownTimeRef.current = null;
    keyHoldTimesRef.current = [];
    keyDelaysRef.current = [];

    lastMousePointRef.current = null;
    lastMouseSpeedRef.current = null;
    mouseSpeedsRef.current = [];
    mouseAccelerationsRef.current = [];
    movementJitterSamplesRef.current = [];

    mouseDownTimeRef.current = null;
    clickLatenciesRef.current = [];
    keyPressCountRef.current = 0;
    sessionStartRef.current = null;
  };

  const extractFeatures = () => {
    const startedAt = sessionStartRef.current || Date.now();
    const elapsedMs = Math.max(1, Date.now() - startedAt);
    const elapsedMinutes = elapsedMs / 60000;

    return {
      typingSpeed: keyPressCountRef.current / elapsedMinutes,
      avgKeyDelay: average(keyDelaysRef.current),
      keyHoldVariance: variance(keyHoldTimesRef.current),
      mouseSpeed: average(mouseSpeedsRef.current) * 1000,
      mouseAcceleration: average(mouseAccelerationsRef.current) * 1000000,
      clickLatency: average(clickLatenciesRef.current),
      movementJitter: average(movementJitterSamplesRef.current)
    };
  };

  const startCapture = () => {
    resetSession();
    setFeatures(null);
    setStatus("Capturing behavior...");
    setIsCapturing(true);
  };

  const stopAndSendCapture = async () => {
    setIsCapturing(false);
    const computedFeatures = extractFeatures();
    setFeatures(computedFeatures);

    try {
      if (autoSend) {
        const payload = { ...computedFeatures };

        if (userId) {
          payload.userId = userId;
        }

        await collectBehaviorFeatures(payload);
        setStatus(`Captured and sent ${sessionEventsRef.current.length} events.`);
      } else {
        setStatus(`Captured ${sessionEventsRef.current.length} events.`);
      }

      if (typeof onCaptureComplete === "function") {
        await onCaptureComplete(computedFeatures, sessionEventsRef.current);
      }
    } catch (error) {
      setStatus(error.response?.data?.message || "Failed to send behavior data.");
    }
  };

  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Behavior Capture</h2>
      <p className="mt-2 text-sm text-slate-500">
        Start a short session, type and move your mouse, then stop capture to extract and store features.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={startCapture}
          disabled={isCapturing}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Start Capture
        </button>
        <button
          type="button"
          onClick={stopAndSendCapture}
          disabled={!isCapturing}
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </div>

      {status && <p className="mt-4 text-sm text-slate-700">{status}</p>}

      {features && (
        <pre className="mt-4 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
          {JSON.stringify(features, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default BehaviorCapture;
