import React, { useState } from "react";
import { useYoutubeProcess } from "@/hooks/useYoutubeProcess";
import styled from "styled-components";

const Container = styled.div``;
const Title = styled.h2``;
const Input = styled.input``;
const Button = styled.button``;

export default function LinkSave() {
  const [url, setUrl] = useState("");
  const { jobId, status, progress, data, error, start, reset } = useYoutubeProcess("http://localhost:8000"); // 실제 API 주소로 수정

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    await start(url);
  };

  return (
    <Container>
      <Title>유튜브 링크 저장/처리</Title>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="유튜브 URL을 입력하세요"
          required
        />
        <Button type="submit" disabled={status === "pending" || status === "processing"}>
          저장
        </Button>
        <Button type="button" onClick={reset} disabled={status === "pending" || status === "processing"}>
          초기화
        </Button>
      </form>
    </Container>
  );
}
