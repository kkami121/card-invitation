"use client";

import { useState } from "react";
import { loadInvitationMetrics } from "@/lib/storage";

type Props = {
  className?: string;
  accentColor?: string;
};

const defaultImageUrl = process.env.NEXT_PUBLIC_TOP_AD_IMAGE_URL;
const defaultLinkUrl = process.env.NEXT_PUBLIC_TOP_AD_LINK_URL;
const defaultAlt = process.env.NEXT_PUBLIC_TOP_AD_ALT ?? "Top banner ad";
const contactEmail = process.env.NEXT_PUBLIC_AD_CONTACT_EMAIL ?? "owner@example.com";

export default function TopBannerAd({ className, accentColor }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopiedOpen, setIsCopiedOpen] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);

  function openModal() {
    const metrics = loadInvitationMetrics();
    setCreatedCount(metrics.createdCount);
    setAcceptedCount(metrics.acceptedCount);
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
            <div className="ad-placeholder">광고주님 자리입니다. 문의는 클릭해 주세요!</div>
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
              <h3 className="ad-modal-title">광고 문의</h3>
             
              <p className="ad-modal-line"><strong>생성된 초대장 수:</strong> {createdCount}</p>
              <p className="ad-modal-line"><strong>초대장을 수락한 사용자 수:</strong> {acceptedCount}</p>
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
                닫기
              </button>
            </section>
          </div>
        ) : null}

        {isCopiedOpen ? (
          <div className="ad-copy-toast" role="status" aria-live="polite">
            복사 완료
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
