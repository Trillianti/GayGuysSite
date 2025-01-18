import React from 'react';

const Navbar = ({ user, setPageId }) => {
  return (
    <div className="flex justify-center py-3">
      {/* Navbar Container */}
        <div className="flex w-full h-20 bg-gray-700 text-white rounded-xl shadow-lg select-none">
            {/* Logo Section */}
            <div className="flex items-center px-6 py-2 cursor-pointer">
            <img
                src="https://placehold.co/50"
                className="w-[50px] h-[50px] rounded-lg"
                alt="Logo"
            />
            <span className='ml-2 text-lg font-bold'>GayGuys</span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center justify-end w-full px-6">
            <div className="px-4 py-2 text-sm font-medium hover:text-gray-400 transition-all duration-300 cursor-pointer" onClick={() => {setPageId(1)}}>
                Головна
            </div>
            {user ? (
                <>
                    <div className="px-4 py-2 text-sm font-medium hover:text-gray-400 transition-all duration-300 cursor-pointer" onClick={() => {setPageId(2)}}>
                        Ігри
                    </div>
                    <div className="px-4 py-2 text-sm font-medium hover:text-gray-400 transition-all duration-300 cursor-pointer" onClick={() => {setPageId(3)}}>
                        Біржа
                    </div>
                    <div className="px-4 py-2 text-sm font-medium hover:text-gray-400 transition-all duration-300 cursor-pointer" onClick={() => {setPageId(4)}}>
                        Банк
                    </div>
                    <div className="px-4 py-2 text-sm font-medium transition-all duration-300 cursor-pointer" onClick={() => {setPageId(5)}}>
                        <img
                            src="https://placehold.co/50"
                            className="w-[50px] h-[50px] rounded-lg"
                            alt="Profile"
                        />
                    </div>
                </>
            ) : (
                <>
                    <div className="px-4 py-2 bg-zinc-600 text-sm rounded-lg font-medium hover:bg-discord hover:rounded-sm transition-all duration-150 cursor-pointer">
                    <i class="fa-brands fa-discord"></i> Авторизація через Discord
                    </div>
                </>
            )}

            
            </div>
        </div>
    </div>
  );
};

export default Navbar;
