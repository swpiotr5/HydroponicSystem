// File: components/login/LoginSidePanel.js
import React from 'react';

const LoginSidePanel = () => {
  return (
    <div className="text-white text-center px-5 py-4 w-100">
      <div className="mb-4">
        <h2 className="display-5 fw-bold">Witamy w <br /> Hydroponic System</h2>
        <p className="lead mt-3">
          Monitoruj swoje uprawy, zarządzaj systemami hydroponicznymi i reaguj na zmiany środowiska w czasie rzeczywistym.
        </p>
      </div>
      <img
        src={require('../../assets/420.png')}
        alt="Hydroponics Illustration"
        className="img-fluid mx-auto d-block"
      />
    </div>
  );
};

export default LoginSidePanel;
