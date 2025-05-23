import React from 'react';

const RegisterSidePanel = () => {
  return (
    <div className="text-white text-center px-4 w-100">
      <h2 className="display-5 fw-bold mb-4">Dołącz do Hydroponic System</h2>
      <p className="lead mb-4">
        Zarejestruj się, aby zarządzać swoimi uprawami i korzystać z pełni możliwości systemu hydroponicznego.
      </p>
      <img src={require('../../assets/abc.png')} alt="Hydroponics Illustration" className="img-fluid mx-auto d-block" style={{ maxWidth: 450 }} />
    </div>
  );
};

export default RegisterSidePanel;
