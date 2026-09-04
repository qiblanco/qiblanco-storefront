import React, { useEffect, useState } from "react";
import { useNavigation } from "react-router";

export default function LoadingBar() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (navigation.state === "loading" || navigation.state === "submitting") {
      setVisible(true);
      setProgress(15);
      const id = setInterval(() => {
        setProgress((p) => Math.min(p + Math.random() * 10, 90));
      }, 200);
      return () => clearInterval(id);
    } else if (visible) {
      setProgress(100);
      const t = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [navigation.state, visible]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        height: "6px",
        width: `${progress}%`,
        background:
          "linear-gradient(90deg, #fffef8ff 0%, #dbd531ff 50%, #f19e32ff 100%)",
        borderRadius: "2px",
        transition: "width 0.25s ease-out, opacity 0.3s ease-out",
        opacity: visible ? 1 : 0,
        // Meldungs-Stufe der Ebenenleiter (ueber Dialogen, unter Consent).
        zIndex: 'var(--z-meldung)',
      }}
    />
  );
}