"use client";

import { useState } from "react";
import { useT } from "@/lib/localeContext";

type Props = {
  className?: string;
  accentColor?: string;
};

const defaultImageUrl = process.env.NEXT_PUBLIC_TOP_AD_IMAGE_URL;
const defaultLinkUrl = process.env.NEXT_PUBLIC_TOP_AD_LINK_URL;
const defaultAlt = process.env.NEXT_PUBLIC_TOP_AD_ALT ?? "Top banner ad";
const contactEmail = process.env.NEXT_PUBLIC_AD_CONTACT_EMAIL ?? "coderstudio404@gmail.com";
const numberFormatter = new Intl.NumberFormat("ko-KR");

export default function TopBannerAd({ className, accentColor }: Props) {
  const t = useT();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopiedOpen, setIsCopiedOpen] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);

  async function openModal() {
    try {
      const response = await fetch("/api/stats", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("failed");
      }
      const metrics = (await response.json()) as { createdCount?: number; acceptedCount?: number };
      setCreatedCount(metrics.createdCount ?? 0);
      setAcceptedCount(metrics.acceptedCount ?? 0);
    } catch {
      setCreatedCount(0);
      setAcceptedCount(0);
    }
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(contactEmail);
    } catch {
      const temp = document.createElement("textarea");
      temp.value = contactEmail;
      temp.style.position = "fixed";
      temp.style.opacity = "0";
      document.body.appendChild(temp);
      temp.focus();
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
    }

    setIsCopiedOpen(true);
    window.setTimeout(() => setIsCopiedOpen(false), 1200);
  }

  if (!defaultImageUrl) {
    return (
      <>
        <div className={className} aria-label="ad-placeholder">
          <button type="button" className="ad-placeholder-btn" onClick={openModal}>
            <div className="ad-placeholder">{t.adPlaceholderText}</div>
          </button>
        </div>

        {isModalOpen ? (
          <div className="ad-modal-backdrop" onClick={closeModal} role="presentation">
            <section
              className="ad-modal"
              role="dialog"
              aria-modal="true"
              aria-label="ad-contact-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <h3 className="ad-modal-title">{t.adContactTitle}</h3>

              <p className="ad-modal-line"><strong>{t.adCreatedCount}</strong> {numberFormatter.format(createdCount)}</p>
              <p className="ad-modal-line"><strong>{t.adAcceptedCount}</strong> {numberFormatter.format(acceptedCount)}</p>
              <p className="ad-modal-line">
                <strong>Email:</strong>{" "}
                <button type="button" className="ad-email-copy" onClick={handleCopyEmail}>
                  {contactEmail}
                </button>
              </p>
              <button
                type="button"
                className="btn-primary ad-modal-close"
                style={accentColor ? { background: accentColor } : undefined}
                onClick={closeModal}
              >
                {t.adClose}
              </button>
            </section>
          </div>
        ) : null}

        {isCopiedOpen ? (
          <div className="ad-copy-toast" role="status" aria-live="polite">
            {t.adEmailCopied}
          </div>
        ) : null}
      </>
    );
  }

  const image = (
    <img
      src={defaultImageUrl}
      alt={defaultAlt}
      className="ad-banner-image"
    />
  );

  return (
    <div className={className}>
      {defaultLinkUrl ? (
        <a
          href={defaultLinkUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="ad-banner-link"
          aria-label={defaultAlt}
        >
          {image}
        </a>
      ) : (
        image
      )}
    </div>
  );
}
