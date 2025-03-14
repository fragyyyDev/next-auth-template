import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ value, onChange, placeholder = 'Tvé heslo' }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative">
            <input
                type={showPassword ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full border border-blue-200 p-2 rounded focus:outline-none focus:border-blue-400"
            />
            <div
                className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
        </div>
    );
};

export default PasswordInput;
