import React, { useState } from 'react';
import { FaCheckCircle, FaArrowLeft, FaArrowRight, FaChair } from 'react-icons/fa';

const SeatMap = ({ seatMaps }) => {
  const [currentCoachIndex, setCurrentCoachIndex] = useState(0);
  const [showSeatMap, setShowSeatMap] = useState(false); // toggle state

  if (!seatMaps || seatMaps.length === 0)
    return (
      <p className="text-red-600 mt-4 p-4 bg-red-50 rounded-lg text-center">
        No seat map available
      </p>
    );

  const currentCoach = seatMaps[currentCoachIndex];
  const isSleeper = ['SL', '3A', '2A'].includes(currentCoach.classType);

  const handleNextCoach = () =>
    setCurrentCoachIndex((prev) => (prev + 1) % seatMaps.length);
  const handlePrevCoach = () =>
    setCurrentCoachIndex((prev) => (prev - 1 + seatMaps.length) % seatMaps.length);

  const renderSeat = (seat, panelType = 'main', position = 'top') => {
    let bgColor = 'bg-white';
    let textColor = 'text-gray-800';
    let borderColor = 'border-[#000080]';

    if (seat.booked) {
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      borderColor = 'border-green-500';
    } else {
      if (panelType === 'side') bgColor = 'bg-red-50';
      else if (panelType === 'main' && position === 'top') bgColor = 'bg-blue-50';
      else if (panelType === 'main' && position === 'bottom') bgColor = 'bg-blue-100';
    }

    return (
      <div
        key={seat.seatNumber}
        className={`w-14 h-14 sm:w-16 sm:h-16 flex flex-col items-center justify-center text-[9px] sm:text-sm font-medium rounded-lg border-2
          ${bgColor} ${textColor} ${borderColor} transition-all duration-200 hover:scale-105 hover:shadow-md`}
        title={
          seat.passenger
            ? `Booked by ${seat.passenger}`
            : `Available: ${seat.berthType} ${seat.seatNumber}`
        }
      >
        <div className="font-semibold">{seat.seatNumber}</div>
        <div className="text-[8px] sm:text-[12px] opacity-80 text-center">{seat.berthType}</div>
        {seat.booked && <FaCheckCircle className="text-green-600 mt-1" size={14} />}
      </div>
    );
  };

  // Build rows
  const rows = [];
  if (isSleeper) {
    let seatIndex = 0;
    while (seatIndex < currentCoach.seats.length) {
      const topLeft = currentCoach.seats.slice(seatIndex, seatIndex + 3);
      seatIndex += 3;
      const bottomLeft = currentCoach.seats.slice(seatIndex, seatIndex + 3);
      seatIndex += 3;
      const sideTop = currentCoach.seats[seatIndex] ? [currentCoach.seats[seatIndex]] : [];
      seatIndex += 1;
      const sideBottom = currentCoach.seats[seatIndex] ? [currentCoach.seats[seatIndex]] : [];
      seatIndex += 1;

      rows.push({ topLeft, bottomLeft, sideTop, sideBottom });
    }
  } else {
    let seatCounter = 0;
    const seatsPerRow = 6;
    while (seatCounter < currentCoach.seats.length) {
      const rowSeats = currentCoach.seats.slice(seatCounter, seatCounter + seatsPerRow);
      seatCounter += seatsPerRow;
      rows.push({ rowSeats });
    }
  }

  return (
    <div className="mt-6">
      {/* Toggle Button */}
      <button
        onClick={() => setShowSeatMap((prev) => !prev)}
        className="w-full bg-[#000080] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#000080]/90 transition mb-4"
      >
        {showSeatMap ? 'Hide Seat Map' : 'Show Seat Map'}
      </button>

      {/* Seat Map (only visible when showSeatMap = true) */}
      {showSeatMap && (
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200 gap-2 sm:gap-0">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#000080]">
                Coach {currentCoach.coachNumber}
              </h3>
              <p className="text-[#DA291C] font-medium">{currentCoach.classType} Class</p>
            </div>

            {seatMaps.length > 1 && (
              <div className="flex gap-2 mt-2 sm:mt-0">
                <button
                  onClick={handlePrevCoach}
                  className="p-2 sm:p-3 bg-white rounded-full hover:bg-gray-100 border border-[#000080] text-[#000080]"
                  aria-label="Previous coach"
                >
                  <FaArrowLeft />
                </button>
                <button
                  onClick={handleNextCoach}
                  className="p-2 sm:p-3 bg-white rounded-full hover:bg-gray-100 border border-[#000080] text-[#000080]"
                  aria-label="Next coach"
                >
                  <FaArrowRight />
                </button>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-3 sm:p-5 rounded-xl border border-gray-200">
            {rows.map((row, idx) => (
              <div key={idx} className="mb-4 last:mb-0">
                {/* Row separator */}
                <div className="flex items-center mb-2">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="px-2 sm:px-3 text-sm font-medium text-[#000080]">
                    Row {idx + 1}
                  </span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* Seats with slider/center align */}
                <div className="w-full">
                  <div className="overflow-x-auto md:overflow-visible">
                    <div className="flex gap-2 min-w-max snap-x snap-mandatory md:justify-center md:min-w-0">
                      {isSleeper ? (
                        <>
                          {/* Main compartment */}
                          <div className="flex flex-col gap-1 mr-2 snap-start">
                            <div className="flex gap-1">
                              {row.topLeft.map((seat) => seat && renderSeat(seat, 'main', 'top'))}
                            </div>
                            <div className="flex gap-1">
                              {row.bottomLeft.map((seat) =>
                                seat && renderSeat(seat, 'main', 'bottom')
                              )}
                            </div>
                          </div>

                          {/* Side compartment */}
                          <div className="flex flex-col gap-1 justify-between border-l border-gray-300 pl-2 snap-start">
                            {row.sideTop.map((seat) => seat && renderSeat(seat, 'side'))}
                            {row.sideBottom.map((seat) => seat && renderSeat(seat, 'side'))}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex gap-1 snap-start">
                            {row.rowSeats.slice(0, 3).map((seat) => seat && renderSeat(seat))}
                          </div>
                          <div className="w-6 border-l border-r border-dashed border-gray-400 flex items-center justify-center text-[9px] sm:text-xs text-gray-500 snap-start">
                            Aisle
                          </div>
                          <div className="flex gap-1 snap-start">
                            {row.rowSeats.slice(3, 6).map((seat) => seat && renderSeat(seat))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="bg-gray-100 p-3 sm:p-4 rounded-xl border border-gray-200 mt-4 text-[#000080]">
            <h4 className="text-sm sm:text-base font-bold text-[#000080] mb-3 flex items-center">
              <FaChair className="mr-2" /> Seat Legend
            </h4>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white border-2 border-[#000080] rounded-lg mr-2"></div>
                <span>Available Seat</span>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-green-100 border-2 border-green-500 rounded-lg mr-2">
                  <FaCheckCircle className="text-green-600" size={14} />
                </div>
                <span>Booked Seat</span>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-50 border border-blue-200 rounded-lg mr-2"></div>
                <span>Top Left Panel</span>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-100 border border-blue-300 rounded-lg mr-2"></div>
                <span>Bottom Left Panel</span>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-red-50 border border-red-200 rounded-lg mr-2"></div>
                <span>Side Berths</span>
              </div>
            </div>

            {isSleeper && (
              <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-600">
                <p>
                  <strong>Layout:</strong> Main compartment (left) with top/bottom panels and side
                  berths (right). Booked seats are green.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatMap;
