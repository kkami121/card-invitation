import { getLocations } from "@/lib/locationStore";

export const runtime = "nodejs";

/**
 * GET — Server-Sent Events 스트림.
 * 4초마다 해당 초대장의 전체 위치 목록을 클라이언트로 전송합니다.
 * lastSeen 기준 30초 이내면 isActive = true.
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const enc = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      function send() {
        const now = Date.now();
        const data = getLocations(id).map((l) => ({
          ...l,
          isActive: now - l.lastSeen < 30_000,
        }));
        try {
          controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // 컨트롤러가 이미 닫힌 경우 무시
        }
      }

      // 연결 즉시 첫 데이터 전송
      send();
      const interval = setInterval(send, 4_000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // 이미 닫힌 경우 무시
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
