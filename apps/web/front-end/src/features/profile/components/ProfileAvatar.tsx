import type { FC } from 'react'
import { Camera } from 'lucide-react'
import { UserAvatar } from '@/components/common/UserAvatar'

interface ProfileAvatarProps {
  avatarUrl?: string | null
  name?: string | null
  onUploadClick?: () => void
}

export const ProfileAvatar: FC<ProfileAvatarProps> = ({ avatarUrl, name, onUploadClick }) => {
  return (
    <div className="flex flex-col items-center gap-3 min-w-[120px] self-center md:self-start">
      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 relative group cursor-pointer shadow-2xs">
        <UserAvatar
          src={avatarUrl}
          name={name}
          className="w-full h-full border-0 rounded-full"
          textClassName="text-2xl font-bold text-slate-700"
          iconClassName="w-10 h-10 text-slate-400"
          theme="light"
        />
        <div 
          onClick={onUploadClick}
          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Camera className="w-5 h-5 text-white" />
        </div>
      </div>
      <button
        type="button"
        onClick={onUploadClick}
        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer active:scale-[0.98]"
      >
        Ganti Foto
      </button>
    </div>
  )
}
