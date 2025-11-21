import { View, ViewProps } from "react-native";

type ElevatedContainerProps = ViewProps & {
    children: React.ReactNode;
    className?: string; // optional for NativeWind
};

export default function ElevatedContainer({
    children,
    className = "",
    ...rest
}: ElevatedContainerProps) {
    return (
        <View
            className={`bg-white rounded-lg shadow-md p-4 ${className}`}
            {...rest}
        >
            {children}
        </View>
    );
}
