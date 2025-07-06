import React from "react";

interface OverallPitchComparisonProps {
  result: any;
  currentScriptIndex: number;
  serverPitchData: any;
  id: string | string[] | undefined;
}

const OverallPitchComparison: React.FC<OverallPitchComparisonProps> = ({ result, currentScriptIndex, serverPitchData, id }) => {
  return (
    <div className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 mt-8">
      <h3 className="text-xl font-semibold mb-6 text-white">Overall Pitch Comparison</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="text-sm text-green-400 mb-2">Your Pitch</div>
          <div className="w-full h-16 bg-gray-700 rounded border border-green-500 relative overflow-hidden">
            {/* MyPitchGraph 등 실제 그래프 컴포넌트 삽입 가능 */}
          </div>
        </div>
        <div>
          <div className="text-sm text-green-400 mb-2">Original Pitch</div>
          <div className="w-full h-16 bg-gray-700 rounded border border-green-500 relative overflow-hidden">
            {/* ServerPitchGraph 등 실제 그래프 컴포넌트 삽입 가능 */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverallPitchComparison; 