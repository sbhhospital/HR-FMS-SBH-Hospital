import React from 'react';
import picture1 from '../Assets/Picture1.png';
import picture2 from '../Assets/Picture2.jpg';
import logo from '../Assets/logo.png';
import hrPolicyPdf from '../Assets/HR_POLICY_SBH_FINAL.pdf';

const HrPolicy = () => {
  const handleDownload = () => {
    // Create a link element
    const link = document.createElement('a');
    link.href = hrPolicyPdf;
    link.download = 'HR_Policy_SBH.pdf';
    link.target = '_blank';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      {/* <div className="text-black bg-indi py-8">
        <div className="container mx-auto px-4 text-center">
          
          <h1 className="text-4xl font-bold">SAI BABA GROUP OF HOSPITALS</h1>
        </div>
      </div> */}

      {/* Doctors Section */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
          <div className="text-center">
            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-lg mx-auto">
              <img src={picture1} alt="Male Doctor" className="w-full h-full object-cover" />
            </div>
          </div>
          <img src={logo} alt="SBH Logo" className="h-16 sm:h-20 md:h-24 mx-auto mb-4 md:mb-0" />
          <div className="text-center">
            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-lg mx-auto">
              <img src={picture2} alt="Female Doctor" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-xl p-8 border-t-4 border-blue-600">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-700 mb-4">HR POLICY MANUAL</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              Formal rules and procedures that define how certain matters should be addressed in the Hospitals 
              including employee rights and duties
            </p>
          </div>

          {/* Policy Details */}
          <div className="space-y-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
              <h3 className="text-xl font-semibold text-blue-700 mb-3">Guidelines Overview</h3>
              <p className="text-gray-700 leading-relaxed">
                Guidelines on the approach of which SBH intends to adopt in managing its people. They represent 
                specific guidelines to Human Resource Department on various matters concerning employment and state 
                the intent of the organization on different aspects of HR management such as recruitment, promotion, 
                compensation, training, selections etc.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-700 mb-3">Purpose</h3>
              <p className="text-gray-700 leading-relaxed">
                They therefore serve as a reference point when human resources management practices are developed or 
                when decisions are being made about an organization's workforce.
              </p>
            </div>
          </div>

          {/* Download Button */}
          <div className="text-center">
            <button
              onClick={handleDownload}
              className="bg-indigo-800 hover:bg-indigo-900 text-white font-bold py-4 px-8 rounded-lg shadow-lg transform transition duration-200 hover:scale-105 inline-flex items-center gap-3"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              Download HR Policy Manual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HrPolicy;