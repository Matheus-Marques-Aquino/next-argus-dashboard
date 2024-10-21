// components/Spinner.js
const LoadingScreen = ({ isLoading }) => {
    if (!isLoading) return null;
    
    return (
      <div id="loading-screen">
        <div className="loading-overlay"></div>
        <div className="spinner"></div>
      </div>
    );
  };
  
  export default LoadingScreen;
  