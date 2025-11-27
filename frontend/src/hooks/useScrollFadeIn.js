import { useEffect } from "react";

export default function useScrollFadeIn() {
  useEffect(() => {
    const elements = document.querySelectorAll(".fade-element");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      {
        threshold: 0.15,  // weicher Trigger
        rootMargin: "0px 0px -5% 0px"
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
