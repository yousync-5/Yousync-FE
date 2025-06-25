import { useRouter } from 'next/router';

export default function DetailPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <h1>상세 페이지</h1>
      <p>현재 ID: {id}</p>
    </div>
  );
}