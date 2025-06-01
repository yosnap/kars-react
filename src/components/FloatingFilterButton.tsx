interface FloatingFilterButtonProps {
  onClick: () => void;
}

const FloatingFilterButton = ({ onClick }: FloatingFilterButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 bg-primary hover:bg-secondary text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
      type="button"
    >
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 6h16M6 10h12M8 14h8M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
};

export default FloatingFilterButton; 