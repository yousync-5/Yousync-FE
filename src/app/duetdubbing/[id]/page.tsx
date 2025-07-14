// 서버 컴포넌트 (기본 틀)
import DubbingContainer from "@/components/dubbing/DubbingContainer";
import type { TokenDetailResponse, ServerPitch } from "@/types/pitch";
import { getServerPitchData } from "@/app/api/hello/getServerpitchData";
import { getDuetTokenDetail } from "@/app/api/hello/getDuetTokenDetail";
import DuetDubbingContainer from "@/components/duetdubbing/DuetDubbingContainer";
// 서버에서 데이터 fetch하는 함수들
export default async function Page({ 
    params, 
    searchParams 
  }: { 
    params: { id: string }; 
    searchParams: { [key: string]: string | string[] | undefined }; 
  }){
    const { id } = params;
    const modalId = searchParams.modalId as string | undefined;
  
    const { tokenData, front_data } = await getDuetTokenDetail(id);
    const serverPitchData = await getServerPitchData(id);
  
    return (
      <DuetDubbingContainer
        tokenData={tokenData}
        front_data={front_data}
        serverPitchData={serverPitchData}
        id={id}
        modalId={modalId}
      />
    );
  }
  