import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import bgImage1 from "../Assets/01.jpg";
import bgImage2 from "../Assets/02.jpg";
import bgImage3 from "../Assets/03.jpg";
import bgImage4 from "../Assets/04.jpg";

export default function JobPoster() {
  const location = useLocation();
  const { post, experience, indentNumber } = location.state || {};
  
  const [details, setDetails] = useState({
    title: "",
    qualification: "",
    experience: "",
    salary: "",
    location: "",
    note: "",
  });

  const [design, setDesign] = useState(1);
  const posterRef = useRef();

  // Update only post and experience when props change (on navigation)
  useEffect(() => {
    if (post || experience) {
      setDetails(prev => ({
        ...prev,
        title: post || "",
        experience: experience || ""
      }));
    }
  }, [post, experience]);

  // Handle input changes
  const handleChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  // Download Poster as Image
const downloadPoster = () => {
    const posterElement = posterRef.current;
    const scale = 3;

    // Get the current background image URL
    const currentBgImage = backgrounds[design - 1];

    // 1. Load the original background image first to get its dimensions
    const bgImage = new Image();
    bgImage.crossOrigin = "anonymous";
    bgImage.onload = () => {
        // Temporarily hide the background image on the poster element
        const originalBgStyle = posterElement.style.backgroundImage;
        posterElement.style.backgroundImage = 'none';

        html2canvas(posterElement, {
            scale: scale,
            useCORS: true,
            backgroundColor: null,
            width: posterElement.offsetWidth,
            height: posterElement.offsetHeight,
        }).then((textCanvas) => {
            // Restore the background image on the original element
            posterElement.style.backgroundImage = originalBgStyle;

            // 2. Create the final high-resolution canvas
            const finalCanvas = document.createElement("canvas");
            finalCanvas.width = bgImage.naturalWidth;
            finalCanvas.height = bgImage.naturalHeight;
            const ctx = finalCanvas.getContext("2d");

            // 3. Draw the original background image onto the final canvas
            ctx.drawImage(bgImage, 0, 0);

            // 4. Draw the text canvas on top, scaled to fit
            ctx.drawImage(textCanvas, 0, 0, finalCanvas.width, finalCanvas.height);

            // 5. Download the combined canvas
            const link = document.createElement("a");
            link.download = `${details.title.replace(/\s+/g, "_")}_Poster.png`;
            link.href = finalCanvas.toDataURL("image/png", 1.0);
            link.click();
        });
    };
    bgImage.src = currentBgImage;
};

  // Background images
  const backgrounds = [bgImage1, bgImage2, bgImage3, bgImage4];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-black mb-6 text">
        Hiring Poster Generator
      </h1>

      {/* Show indent info if available */}
      {/* {indentNumber && (
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-4">
          <p className="text-blue-800 font-medium">
            Generating creative for Indent: <span className="font-bold">{indentNumber}</span>
          </p>
        </div>
      )} */}

      {/* Rest of the component remains exactly the same */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl">
        {/* Form */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Enter Job Details</h2>
          {Object.keys(details).map((key) => (
            <div key={key} className="mb-4">
              <label className="block text-sm font-medium capitalize">
                {key}
              </label>
              <input
                type="text"
                name={key}
                value={details[key]}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border rounded-lg"
              />
            </div>
          ))}
        </div>

        {/* Poster Preview + Buttons */}
        <div className="flex flex-col items-center">
          <div
            ref={posterRef}
            className="relative shadow-2xl rounded-2xl overflow-hidden"
            style={{
              width: "500px",
              height: "500px",
              backgroundImage: `url(${backgrounds[design - 1]})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          >
            {/* Design 1 */}
            {design === 1 && (
              <>
                <div
                  className="absolute left-4 top-[155px] text-yellow-300 font-bold text-3xl drop-shadow-md max-w-[60%] break-words leading-tight"
                  style={{
                    textShadow: "1px 1px 2px rgba(0,0,0,0.5)", // subtle dark shadow
                  }}
                >
                  {details.title}
                </div>
                <div className="absolute left-32 top-[237px] text-white text-sm">
                  {details.qualification}
                </div>
                <div className="absolute left-28 top-[263px] text-white text-sm">
                  {details.experience}
                </div>
                <div className="absolute left-20 top-[290px] text-white text-sm">
                  {details.salary}
                </div>
                <div className="absolute left-24 top-[317px] text-white text-sm">
                  {details.location}
                </div>
                <div className="absolute left-6 top-[350px] text-white font-bold text-lg">
                  {details.note}
                </div>
              </>
            )}

            {/* Design 2 */}
            {design === 2 && (
              <>
                <div className="absolute left-4 top-[174px] text-blue-600 font-extrabold text-3xl drop-shadow-md">
                  {details.title}
                </div>
                <div className="text absolute left-32 top-[228px] text-blue-600 text-sm font-bold">
                  {details.qualification}
                </div>
                <div className="text absolute left-28 top-[251px] text-blue-600 text-sm font-bold">
                  {details.experience}
                </div>
                <div className="text absolute left-20 top-[273px] text-blue-600 text-sm font-bold">
                  {details.salary}
                </div>
                <div className="text absolute left-24 top-[295px] text-blue-600 text-sm font-bold">
                  {details.location}
                </div>
                <div className="absolute left-6 top-[364px] text-blue-600 font-bold text-lg">
                  {details.note}
                </div>
              </>
            )}

            {/* Design 3 */}
            {design === 3 && (
              <>
                <div className="absolute left-10 top-[212px] text-yellow-300 font-bold text-md uppercase tracking-wide">
                  {details.title}
                </div>
                <div className="absolute left-28 top-[284px] text-gray-600 text-xs font-bold">
                  {details.qualification}
                </div>
                <div className="absolute left-28 top-[313px] text-gray-600 text-xs font-bold">
                  {details.experience}
                </div>
                <div className="absolute left-28 top-[342px] text-gray-600 text-xs font-bold">
                  {details.salary}
                </div>
                <div className="absolute left-28 top-[367px] text-gray-600 text-xs font-bold">
                  {details.location}
                </div>
                <div className="absolute left-6 top-[399px] text-red-600 font-bold text-lg">
                  {details.note}
                </div>
              </>
            )}

            {/* Design 4 */}
            {design === 4 && (
              <>
                <div className="text absolute left-5 top-[70px] text-red-600 font-bold text-4xl uppercase tracking-wide max-w-[50%] break-words leading-tight">
                  {details.title}
                </div>
                <div className="text absolute left-36 top-[222px] text-gray-600 text-md">
                  {details.qualification}
                </div>
                <div className="text absolute left-32 top-[245px] text-gray-600 text-md">
                  {details.experience}
                </div>
                <div className="text absolute left-24 top-[267px] text-gray-600 text-md">
                  {details.salary}
                </div>
                <div className="text absolute left-28 top-[289px] text-gray-600 text-md">
                  {details.location}
                </div>
                <div className="text absolute left-10 top-[350px] text-red-600 font-bold text-2xl tracking-wide max-w-[50%] break-words leading-tight">
                  {details.note}
                </div>
              </>
            )}
          </div>

          {/* Buttons just below the poster */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={downloadPoster}
              className="bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-yellow-400"
            >
              Download Creative
            </button>
            <button
              onClick={() => setDesign(design === 4 ? 1 : design + 1)}
              className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-blue-500"
            >
              Change Design
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}