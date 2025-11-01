import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaDownload, FaShare, FaEnvelope, FaCheckCircle, FaExclamationCircle, FaTrain, FaUser, FaRupeeSign, FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import SeatMap from './SeatMap';

const BookingSuccessPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const pdfTemplateRef = useRef();
  const [isSharing, setIsSharing] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [email, setEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  if (!state?.bookingData || !state?.bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#000080] to-[#1a1a8a] p-4 font-sans">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transform hover:scale-105 transition-transform duration-300">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationCircle className="text-2xl text-[#DA291C]" />
          </div>
          <h2 className="text-2xl font-bold text-[#DA291C] mb-3">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">No booking information available. Please try booking again.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#000080] to-[#1a1a8a] text-white rounded-lg font-semibold hover:from-[#000066] hover:to-[#151566] transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const { bookingData, bookingId, paymentId } = state;
  const { pnr } = bookingData;

  // Format dates and times
  const formatDate = (date) => {
    if (!date) return '--';
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '--';
    }
  };

  const departureDate = formatDate(bookingData.departureDate);
  const arrivalDate = formatDate(bookingData.arrivalDate);
  const departureTime = bookingData.departureTime || bookingData.departTime || 'N/A';
  const arrivalTime = bookingData.arrivalTime || bookingData.arrivalTime || 'N/A';
  const travelDate = bookingData.departureDate || bookingData.travelDate;
  const formattedDate = formatDate(travelDate);

  const showMessage = (message, type = 'success', duration = 4000) => {
    setEmailMessage(message);
    setMessageType(type);
    setTimeout(() => setEmailMessage(''), duration);
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    showMessage(`✓ ${field} copied!`, 'success', 2000);
  };

  // ✅ FIXED PDF GENERATION - DEDICATED PDF TEMPLATE
  const generatePDFTicket = async () => {
    setIsDownloading(true);
    try {
      // Create a dedicated PDF container with simple, PDF-friendly styling
      const pdfContainer = document.createElement('div');
      pdfContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 210mm;
        min-height: 297mm;
        background: white;
        padding: 15mm;
        font-family: Arial, sans-serif;
        z-index: 10000;
        box-sizing: border-box;
      `;

      // PDF content with simple, reliable styling
      pdfContainer.innerHTML = `
        <div style="border: 2px solid #000080; border-radius: 8px; padding: 0; overflow: hidden; background: white;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #000080, #1a1a8a); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0 0 5px 0; font-size: 28px; font-weight: bold;">🚂 INDIAN RAILWAYS</h1>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">E-TICKET • DIGITAL BOARDING PASS</p>
          </div>

          <!-- PNR and Booking ID -->
          <div style="display: flex; gap: 15px; padding: 20px; background: #f8f9fa; border-bottom: 2px dashed #ccc;">
            <div style="flex: 1; text-align: center; background: white; padding: 12px; border: 2px solid #000080; border-radius: 6px;">
              <p style="margin: 0 0 5px 0; font-size: 11px; color: #666; font-weight: bold; text-transform: uppercase;">PNR NUMBER</p>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #000080; letter-spacing: 2px;">${pnr}</p>
            </div>
            <div style="flex: 1; text-align: center; background: #DA291C; padding: 12px; border: 2px solid #000080; border-radius: 6px;">
              <p style="margin: 0 0 5px 0; font-size: 11px; color: white; font-weight: bold; text-transform: uppercase;">BOOKING ID</p>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: white; letter-spacing: 2px;">${bookingId}</p>
            </div>
          </div>

          <!-- Journey Route -->
          <div style="padding: 25px 20px; border-bottom: 2px dashed #ccc;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="text-align: center; flex: 1;">
                <div style="width: 16px; height: 16px; background: #000080; border-radius: 50%; margin: 0 auto 10px;"></div>
                <p style="margin: 0 0 5px 0; font-size: 12px; color: #666; font-weight: bold; text-transform: uppercase;">FROM</p>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #000080;">${bookingData.from}</p>
              </div>
              
              <div style="flex: 2; position: relative; margin: 0 20px;">
                <div style="height: 3px; background: linear-gradient(90deg, #000080, #DA291C); border-radius: 2px;"></div>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 0 10px;">
                  <span style="font-size: 20px;">🚂</span>
                </div>
              </div>
              
              <div style="text-align: center; flex: 1;">
                <div style="width: 16px; height: 16px; background: #DA291C; border-radius: 50%; margin: 0 auto 10px;"></div>
                <p style="margin: 0 0 5px 0; font-size: 12px; color: #666; font-weight: bold; text-transform: uppercase;">TO</p>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #DA291C;">${bookingData.to}</p>
              </div>
            </div>
          </div>

          <!-- Train Details -->
          <div style="padding: 20px; border-bottom: 2px dashed #ccc;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <!-- Train Info -->
              <div style="background: #f0f8ff; padding: 15px; border-radius: 6px; border-left: 4px solid #000080;">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; font-weight: bold; text-transform: uppercase;">TRAIN DETAILS</p>
                <p style="margin: 0 0 5px 0; font-size: 18px; font-weight: bold; color: #000080;">${bookingData.trainName}</p>
                <p style="margin: 0; font-size: 14px; color: #666;">No: ${bookingData.trainNumber} • ${bookingData.classType}</p>
              </div>

              <!-- Journey Date -->
              <div style="background: #f0fff0; padding: 15px; border-radius: 6px; border-left: 4px solid #4CAF50;">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; font-weight: bold; text-transform: uppercase;">JOURNEY DATE</p>
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #000080;">${formattedDate}</p>
              </div>

              <!-- Schedule -->
              <div style="background: #fff8f0; padding: 15px; border-radius: 6px; border-left: 4px solid #FF8C00;">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; font-weight: bold; text-transform: uppercase;">SCHEDULE</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  <div>
                    <p style="margin: 0 0 3px 0; font-size: 11px; color: #666;">Departure</p>
                    <p style="margin: 0; font-size: 16px; font-weight: bold; color: #000080;">${departureTime}</p>
                  </div>
                  <div>
                    <p style="margin: 0 0 3px 0; font-size: 11px; color: #666;">Arrival</p>
                    <p style="margin: 0; font-size: 16px; font-weight: bold; color: #000080;">${arrivalTime}</p>
                  </div>
                </div>
              </div>

              <!-- Total Fare -->
              <div style="background: #f8f0ff; padding: 15px; border-radius: 6px; border-left: 4px solid #9C27B0;">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; font-weight: bold; text-transform: uppercase;">TOTAL FARE</p>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #DA291C;">₹${bookingData.totalFare}</p>
                <p style="margin: 5px 0 0 0; font-size: 11px; color: #666;">Inclusive of all taxes</p>
              </div>
            </div>
          </div>

          <!-- Passenger Details -->
          <div style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
              <span style="font-size: 18px;">👤</span>
              <h2 style="margin: 0; font-size: 18px; color: #000080; font-weight: bold;">
                PASSENGER DETAILS (${bookingData.passengers?.length || 0})
              </h2>
            </div>

            ${bookingData.passengers?.map((p, i) => `
              <div style="background: #f8f9fa; border: 1px solid #ddd; border-left: 4px solid #000080; border-radius: 6px; padding: 15px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: between; align-items: flex-start; margin-bottom: 10px;">
                  <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                    <div style="width: 24px; height: 24px; background: #000080; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">
                      ${i + 1}
                    </div>
                    <div>
                      <p style="margin: 0 0 3px 0; font-size: 16px; font-weight: bold; color: #000080;">${p.name}</p>
                      <p style="margin: 0; font-size: 12px; color: #666;">${p.gender}, ${p.age} years</p>
                    </div>
                  </div>
                  <div style="background: #4CAF50; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold;">
                    CONFIRMED
                  </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px;">
                  <div>
                    <p style="margin: 0 0 3px 0; font-size: 10px; color: #666; font-weight: bold;">COACH</p>
                    <p style="margin: 0; font-size: 14px; font-weight: bold; color: #000080;">${p.coachNumber}</p>
                  </div>
                  <div>
                    <p style="margin: 0 0 3px 0; font-size: 10px; color: #666; font-weight: bold;">SEAT/BERTH</p>
                    <p style="margin: 0; font-size: 14px; font-weight: bold; color: #DA291C;">${p.allocatedSeat}</p>
                  </div>
                  <div>
                    <p style="margin: 0 0 3px 0; font-size: 10px; color: #666; font-weight: bold;">PREFERENCE</p>
                    <p style="margin: 0; font-size: 14px; font-weight: bold; color: #000080;">${p.berthPreference || 'Auto'}</p>
                  </div>
                  <div>
                    <p style="margin: 0 0 3px 0; font-size: 10px; color: #666; font-weight: bold;">ALLOCATED</p>
                    <p style="margin: 0; font-size: 14px; font-weight: bold; color: #000080;">${p.seatPreference}</p>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 2px dashed #ccc;">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
              🎫 This is a digitally generated e-ticket. No print required.
            </p>
            <p style="margin: 0; font-size: 11px; color: #666;">
              Please carry original ID proof during the journey. Generated on ${new Date().toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      `;

      document.body.appendChild(pdfContainer);

      // Generate PDF with optimal settings
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: pdfContainer.scrollWidth,
        height: pdfContainer.scrollHeight,
        windowWidth: pdfContainer.scrollWidth,
        windowHeight: pdfContainer.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedContainer = clonedDoc.querySelector('[style*="position: fixed"]');
          if (clonedContainer) {
            clonedContainer.style.position = 'absolute';
            clonedContainer.style.top = '0';
            clonedContainer.style.left = '0';
          }
        }
      });

      document.body.removeChild(pdfContainer);

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`ticket-${bookingId}.pdf`);
      
      showMessage('✓ Ticket downloaded successfully!', 'success');
    } catch (error) {
      console.error('PDF download failed:', error);
      showMessage('Failed to download ticket. Please try again.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  // Share booking details
  const shareTicket = async () => {
    setIsSharing(true);
    const shareText = `🎫 Train Ticket Booking Confirmation\n\n` +
      `🚂 ${bookingData.trainName} (${bookingData.trainNumber})\n` +
      `📍 ${bookingData.from} → ${bookingData.to}\n` +
      `📅 ${formattedDate}\n` +
      `⏰ ${departureTime} - ${arrivalTime}\n` +
      `🎫 ${bookingData.classType} Class\n` +
      `👥 ${bookingData.passengers?.length || 0} Passenger(s)\n` +
      `💰 ₹${bookingData.totalFare}\n` +
      `📋 PNR: ${pnr}\n` +
      `🆔 Booking ID: ${bookingId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Train Ticket Booking Confirmation',
          text: shareText,
        });
        showMessage('✓ Booking details shared successfully!', 'success');
      } else {
        navigator.clipboard.writeText(shareText);
        showMessage('✓ Booking details copied to clipboard!', 'success');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.log('Sharing cancelled:', error);
      }
    }
    setIsSharing(false);
  };

  // Send email (simulated)
  const sendEmail = async () => {
    if (!email.trim() || !email.includes('@')) {
      showMessage('Please enter a valid email address', 'error');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      showMessage(`✓ Ticket sent to ${email} successfully!`, 'success');
      setEmail('');
      setIsEmailing(false);
    } catch (error) {
      console.error('Email sending failed:', error);
      showMessage('Error sending email. Please try again.', 'error');
    }
  };

  const generateSeatMap = (bookingData) => {
    if (!bookingData || !bookingData.passengers || bookingData.passengers.length === 0) {
      return [];
    }

    const coaches = {};
    const totalSeatsPerClass = {
      '2S': 90,
      'CC': 72,
      'SL': 72,
      '3A': 64,
      '2A': 46,
    };

    const assignBerth = (classType, seatIndex) => {
      if (classType === 'SL' || classType === '3A') {
        const pattern = ['Lower', 'Middle', 'Upper', 'Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper'];
        return pattern[seatIndex % 8];
      }
      if (classType === '2A') {
        const pattern = ['Lower', 'Upper', 'Lower', 'Upper', 'Side Lower', 'Side Upper'];
        return pattern[seatIndex % 6];
      }
      if (classType === '2S' || classType === 'CC') {
        const pattern = ['Window', 'Middle', 'Aisle', 'Window', 'Middle', 'Aisle'];
        return pattern[seatIndex % pattern.length];
      }
      return 'Lower';
    };

    bookingData.passengers.forEach(passenger => {
      const classType = bookingData.classType;
      const coachNumber = passenger.coachNumber;
      const seatNumber = passenger.seatNumber;

      if (!coachNumber || seatNumber == null) return;

      const totalSeats = totalSeatsPerClass[classType] || 72;

      if (!coaches[coachNumber]) {
        coaches[coachNumber] = {
          coachNumber,
          classType,
          seats: Array.from({ length: totalSeats }, (_, i) => ({
            seatNumber: i + 1,
            berthType: assignBerth(classType, i),
            booked: false,
            passenger: null,
          })),
        };
      }

      const coach = coaches[coachNumber];
      const seatIndex = seatNumber - 1;
      if (seatIndex >= 0 && seatIndex < coach.seats.length) {
        coach.seats[seatIndex].booked = true;
        coach.seats[seatIndex].passenger = passenger.name;
      }
    });

    return Object.values(coaches);
  };

  const seatMaps = generateSeatMap(bookingData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faff] to-[#eef2ff] py-8 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-[#000080] opacity-5 rounded-full"></div>
          <div className="relative">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg">
              <FaCheckCircle className="text-4xl text-green-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#000080] mb-4 bg-gradient-to-r from-[#000080] to-[#1a1a8a] bg-clip-text text-transparent">
              Booking Confirmed!
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your tickets have been successfully booked. You can download, share, or email your e-ticket below.
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Ticket Card - Main Content */}
          <div className="lg:col-span-2">
            {/* Display Ticket Preview */}
            <div
              ref={pdfTemplateRef}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 hover:shadow-3xl transition-all duration-300"
            >
              {/* Ticket Header */}
              <div className="bg-gradient-to-r from-[#000080] to-[#1a1a8a] p-4 md:p-6 relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="text-white flex-1">
                    <h2 className="text-2xl md:text-3xl font-bold mb-1 flex items-center gap-3">
                      <FaTrain className="text-yellow-300" />
                      INDIAN RAILWAYS
                    </h2>
                    <p className="text-blue-100 opacity-90 text-xs md:text-sm font-semibold">E-TICKET • DIGITAL BOARDING PASS</p>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto flex-col sm:flex-row items-stretch sm:items-center">
                    <div 
                      className="bg-white bg-opacity-95 rounded-lg px-3 py-2 text-center border-2 border-yellow-300 flex-1 sm:flex-none cursor-pointer hover:bg-opacity-100 transition-all duration-200 shadow-md hover:shadow-lg"
                      onClick={() => copyToClipboard(pnr, 'PNR')}
                      title="Click to copy"
                    >
                      <p className="text-[#000080] text-xs font-bold uppercase tracking-wider mb-0.5">PNR</p>
                      <p className="text-[#000080] text-sm font-bold tracking-widest break-all" style={{ wordBreak: 'break-word', lineHeight: '1.2' }}>
                        {pnr}
                      </p>
                      {copiedField === 'PNR' && (
                        <p className="text-green-600 text-xs mt-0.5 font-semibold">✓ Copied</p>
                      )}
                    </div>

                    <div 
                      className="bg-[#DA291C] rounded-lg px-3 py-2 text-center border-2 border-yellow-300 flex-1 sm:flex-none cursor-pointer hover:bg-[#c73229] transition-all duration-200 shadow-md hover:shadow-lg"
                      onClick={() => copyToClipboard(bookingId, 'Booking ID')}
                      title="Click to copy"
                    >
                      <p className="text-white text-xs font-bold uppercase tracking-wider mb-0.5">Booking ID</p>
                      <p className="text-white text-sm font-bold tracking-widest break-all" style={{ wordBreak: 'break-word', lineHeight: '1.2' }}>
                        {bookingId}
                      </p>
                      {copiedField === 'Booking ID' && (
                        <p className="text-yellow-300 text-xs mt-0.5 font-semibold">✓ Copied</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Body */}
              <div className="p-6 md:p-8">
                {/* Journey Route */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-center flex-1">
                      <div className="w-4 h-4 bg-[#000080] rounded-full mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500 font-semibold uppercase mb-1">From</p>
                      <p className="text-2xl font-bold text-[#000080]">{bookingData.from}</p>
                    </div>
                    <div className="flex-1 px-4">
                      <div className="relative">
                        <div className="h-1 bg-gradient-to-r from-[#000080] to-[#DA291C] rounded-full"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#DA291C] rounded-full flex items-center justify-center">
                          <FaTrain className="text-white text-sm" />
                        </div>
                      </div>
                    </div>
                    <div className="text-center flex-1">
                      <div className="w-4 h-4 bg-[#DA291C] rounded-full mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500 font-semibold uppercase mb-1">To</p>
                      <p className="text-2xl font-bold text-[#DA291C]">{bookingData.to}</p>
                    </div>
                  </div>
                </div>

                {/* Train and Schedule Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <FaTrain className="text-[#000080] text-xl mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 font-semibold uppercase">Train Details</p>
                        <p className="text-lg font-bold text-[#000080]">{bookingData.trainName}</p>
                        <p className="text-gray-600 text-sm">No: {bookingData.trainNumber} • {bookingData.classType}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                      <FaCalendarAlt className="text-green-600 text-xl mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 font-semibold uppercase">Journey Date</p>
                        <p className="text-lg font-bold text-gray-800">{formattedDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
                      <FaClock className="text-orange-600 text-xl mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 font-semibold uppercase">Schedule</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Departure</p>
                            <p className="font-bold text-gray-800 text-lg">{departureTime}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Arrival</p>
                            <p className="font-bold text-gray-800 text-lg">{arrivalTime}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                      <FaRupeeSign className="text-purple-600 text-xl mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 font-semibold uppercase">Total Fare</p>
                        <p className="text-2xl font-bold text-[#DA291C]">₹{bookingData.totalFare}</p>
                        <p className="text-xs text-gray-500">All charges included</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Passenger Details */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <FaUser className="text-[#000080] text-xl" />
                    <h3 className="text-xl font-bold text-[#000080]">Passenger Details</h3>
                    <span className="bg-[#000080] text-white text-sm px-3 py-1 rounded-full font-bold">
                      {bookingData.passengers?.length || 0}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {bookingData.passengers?.map((p, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#000080] transition-colors duration-300">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-10 h-10 bg-[#000080] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-3 mb-2">
                                <p className="text-lg font-bold text-gray-800">{p.name}</p>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap">
                                  Confirmed
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500 text-xs font-semibold">Gender & Age</p>
                                  <p className="font-bold text-gray-800">{p.gender}, {p.age} yrs</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs font-semibold">Coach</p>
                                  <p className="font-bold text-[#000080]">{p.coachNumber}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs font-semibold">Seat/Berth</p>
                                  <p className="font-bold text-[#DA291C]">{p.allocatedSeat}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs font-semibold">Preference</p>
                                  <p className="font-bold text-gray-800">{p.berthPreference || 'Auto'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ticket Footer */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="text-center text-gray-500 text-sm">
                    <p className="mb-2">🎫 This is a digitally generated e-ticket. No print required.</p>
                    <p>Please carry original ID proof during the journey. Generated on {new Date().toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200 sticky top-6">
              <h3 className="text-xl font-bold text-[#000080] mb-6 text-center">Quick Actions</h3>
              <div className="space-y-4">
                <button
                  onClick={generatePDFTicket}
                  disabled={isDownloading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#000080] to-[#1a1a8a] text-white rounded-xl font-semibold hover:from-[#000066] hover:to-[#151566] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaDownload className="text-lg" />
                  {isDownloading ? 'Downloading...' : 'Download Ticket'}
                </button>

                <button
                  onClick={shareTicket}
                  disabled={isSharing}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#1a4c8e] to-[#2a5c9e] text-white rounded-xl font-semibold hover:from-[#153a6e] hover:to-[#1a4c8e] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaShare className="text-lg" />
                  {isSharing ? 'Sharing...' : 'Share Details'}
                </button>

                <button
                  onClick={() => setIsEmailing(true)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#DA291C] to-[#ea392c] text-white rounded-xl font-semibold hover:from-[#b72219] hover:to-[#c73229] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaEnvelope className="text-lg" />
                  Email Ticket
                </button>
              </div>
            </div>

            {/* Booking Summary Card */}
            <div className="bg-gradient-to-br from-[#000080] to-[#1a1a8a] rounded-3xl shadow-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-6 text-center">Booking Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white border-opacity-20">
                  <span className="text-blue-100">Status</span>
                  <span className="bg-green-400 text-[#000080] px-3 py-1 rounded-full text-sm font-bold">Confirmed</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white border-opacity-20">
                  <span className="text-blue-100">Train</span>
                  <span className="font-semibold text-right">{bookingData.trainNumber}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white border-opacity-20">
                  <span className="text-blue-100">Class</span>
                  <span className="font-semibold">{bookingData.classType}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white border-opacity-20">
                  <span className="text-blue-100">Passengers</span>
                  <span className="font-semibold">{bookingData.passengers?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-blue-100">Total Amount</span>
                  <span className="text-xl font-bold text-yellow-300">₹{bookingData.totalFare}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seat Map Section */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-gray-200">
          <div className="bg-gradient-to-r from-[#000080] to-[#1a1a8a] p-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <FaMapMarkerAlt className="text-yellow-300" />
              Seat & Coach Layout
            </h3>
          </div>
          <div className="p-6">
            <SeatMap seatMaps={seatMaps} classType={bookingData.classType} />
          </div>
        </div>

        {/* Messages Toast */}
        {emailMessage && (
          <div
            className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 transform transition-all duration-300 ${
              messageType === 'success' 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
            }`}
          >
            {messageType === 'success' ? (
              <FaCheckCircle className="text-xl" />
            ) : (
              <FaExclamationCircle className="text-xl" />
            )}
            <span className="font-semibold">{emailMessage}</span>
          </div>
        )}

        {/* Email Modal */}
        {isEmailing && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaEnvelope className="text-2xl text-[#000080]" />
                </div>
                <h3 className="text-2xl font-bold text-[#000080] mb-2">Email Your Ticket</h3>
                <p className="text-gray-600">Enter your email to receive the e-ticket</p>
              </div>
              
              <div className="mb-6">
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#000080] focus:ring-4 focus:ring-[#000080] focus:ring-opacity-20 transition-all duration-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendEmail()}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsEmailing(false);
                    setEmail('');
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={sendEmail}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#000080] to-[#1a1a8a] text-white rounded-xl font-semibold hover:from-[#000066] hover:to-[#151566] transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Send Ticket
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#000080] to-[#1a1a8a] text-white rounded-2xl font-bold hover:from-[#000066] hover:to-[#151566] transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
          >
            <FaHome className="text-lg" />
            Back to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;