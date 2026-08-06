import React from "react";
import { TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/component/ui/Card";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Cari berdasarkan ID atau Blok...",
}: SearchBarProps) {
  return (
    <Card className=" flex-row items-center gap-2 px-4 py-3">
      <Ionicons name="search" size={18} color="#9CA3AF" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        className="flex-1 text-sm text-gray-800"
      />
    </Card>
  );
}
