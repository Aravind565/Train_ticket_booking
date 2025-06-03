import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, UserIcon, PhoneIcon, CakeIcon } from "@heroicons/react/24/outline";

export const LoadingSpinner = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center p-4">
    <div className="relative h-12 w-12">
      <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
    </div>
    <p className="mt-3 text-sm text-gray-500">{text}</p>
  </div>
);

export const InputField = ({ 
  icon, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  onBlur,
  name,
  error,
  required = false,
  showPasswordToggle = false,
  togglePasswordVisibility,
  className = "",
  ...props 
}) => {
  const IconComponent = {
    email: EnvelopeIcon,
    password: LockClosedIcon,
    user: UserIcon,
    phone: PhoneIcon,
    age: CakeIcon
  }[icon] || null;

  return (
    <div className={`mb-4 ${className}`}>
      <div className="relative">
        {IconComponent && (
          <IconComponent className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
        )}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          className={`w-full ${IconComponent ? 'pl-12' : 'pl-5'} pr-${showPasswordToggle ? '12' : '4'} py-3.5 rounded-lg border border-gray-200/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 bg-white/90 text-gray-700 placeholder-gray-400/80 shadow-sm transition-all duration-200`}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors bg-transparent border-none p-0"
            onClick={togglePasswordVisibility}
            aria-label={type === "password" ? "Show password" : "Hide password"}
            tabIndex={-1}
          >
            {type === "password" ? (
              <EyeIcon className="w-5 h-5" />
            ) : (
              <EyeSlashIcon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-500 px-1">
          {error}
        </p>
      )}
    </div>
  );
};

export const AuthButton = ({ loading, children, ...props }) => (
  <button
    {...props}
    className={`
      w-full py-3.5 px-6
      bg-gradient-to-r from-primary to-primary/90
      text-white font-semibold
      rounded-lg shadow-[0_4px_14px_rgba(218,41,28,0.25)]
      border border-primary/50
      transition-all duration-300 hover:from-primary/90 hover:to-primary/80
      hover:shadow-[0_6px_20px_rgba(218,41,28,0.3)] hover:translate-y-[-1px]
      focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2
      text-lg
      disabled:opacity-80 disabled:cursor-not-allowed
      flex items-center justify-center
      relative overflow-hidden
      group
      ${props.className || ''}
    `}
  >
    {loading ? (
      <LoadingSpinner />
    ) : (
      <>
        <span className="absolute inset-0 bg-white/10 group-hover:bg-white/5 transition-all duration-500"></span>
        <span className="relative z-10">{children}</span>
      </>
    )}
  </button>
);

export const AuthMessage = ({ type = "error", children }) => (
  <div className={`mb-5 text-center font-medium rounded-lg py-2 px-4 shadow-sm animate-fade-in ${
    type === "error" 
      ? "text-red-600 bg-red-50/80" 
      : "text-green-700 bg-green-50/80"
  }`}>
    {children}
  </div>
);

export const SocialAuthButton = ({ provider, icon, ...props }) => (
  <button
    {...props}
    className="flex items-center justify-center w-full py-3 px-4
    border border-gray-200 rounded-lg bg-white
    text-gray-700 font-medium
    transition-all duration-300
    hover:border-gray-300 hover:shadow-sm
    focus:outline-none focus:ring-2 focus:ring-primary/20
    relative overflow-hidden group"
  >
    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 -translate-x-full group-hover:translate-x-0"></span>
    <img src={icon} className="w-5 h-5 mr-3" alt={provider} />
    {`Continue with ${provider}`}
  </button>
);