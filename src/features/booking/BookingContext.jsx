import React, { createContext, useState, useContext } from 'react';

const BookingContext = createContext();

export const useBooking = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
  const [bookingState, setBookingState] = useState({
    isOpen: false,
    currentStep: 1,
    selectedItem: null,
    details: {
      checkIn: '',
      checkOut: '',
      guests: 2,
      roomType: 'Standard Room',
      addons: [],
      guestName: '',
      guestTitle: 'Mr',
      contactNumber: '',
      specialRequests: '',
      paymentMethod: '',
    },
  });

  const openBookingWizard = (item) => {
    setBookingState((prev) => ({
      ...prev,
      isOpen: true,
      currentStep: 1,
      selectedItem: item,
    }));
  };

  const closeBookingWizard = () => {
    setBookingState((prev) => ({ ...prev, isOpen: false }));
  };

  const nextStep = () => {
    setBookingState((prev) => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, 6) }));
  };

  const prevStep = () => {
    setBookingState((prev) => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 1) }));
  };

  const updateDetails = (key, value) => {
    setBookingState((prev) => ({
      ...prev,
      details: { ...prev.details, [key]: value },
    }));
  };

  return (
    <BookingContext.Provider
      value={{
        bookingState,
        openBookingWizard,
        closeBookingWizard,
        nextStep,
        prevStep,
        updateDetails,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
