import { useState, type FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { qrGeneratorSchema, type QrGeneratorFormValues } from '../../../schemas/qrSchema'
import { FormWrapper } from '../../../components/form/FormWrapper'
import { InputField } from '../../../components/form/InputField'
import { SelectField } from '../../../components/form/SelectField'
import { Button } from '../../../components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card'
import { PlusCircle, CheckCircle2 } from 'lucide-react'

interface QrGeneratorFormProps {
  onGenerate: (data: QrGeneratorFormValues) => void
}

export const QrGeneratorForm: FC<QrGeneratorFormProps> = ({ onGenerate }) => {
  const [successNotice, setSuccessNotice] = useState(false)

  const methods = useForm<QrGeneratorFormValues>({
    resolver: zodResolver(qrGeneratorSchema),
    defaultValues: {
      targetType: 'Sensor',
      targetName: '',
      blockId: 'BLK-NAGA-A1',
      technicianName: '',
      batchQuantity: 5,
      notes: '',
    },
    mode: 'onTouched',
  })

  const onSubmit = (data: QrGeneratorFormValues) => {
    onGenerate(data)
    setSuccessNotice(true)
    methods.reset()
    setTimeout(() => setSuccessNotice(false), 4000)
  }

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <PlusCircle className="h-4 w-4 text-emerald-600" />
          Buat Batch Stiker Baru
        </CardTitle>
        <CardDescription>
          Form divalidasi dengan Zod schema khusus kepatuhan penamaan aset kebun
        </CardDescription>
      </CardHeader>

      <CardContent>
        {successNotice && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Stiker QR berhasil dibuat dan ditambahkan ke daftar tunggu cetak!</span>
          </div>
        )}

        <FormWrapper methods={methods} onSubmit={onSubmit} className="space-y-4">
          <SelectField
            name="targetType"
            label="Tipe Target Aset"
            options={[
              { label: 'Sensor IoT / Node Telemetri', value: 'Sensor' },
              { label: 'Tiang Sulur / Blok Lahan', value: 'Blok' },
            ]}
            required
          />

          <InputField
            name="targetName"
            label="Nama Identitas Target"
            placeholder="misal: Sensor Lux Kanopi Tiang 04"
            helperText="Nama deskriptif lokasi fisik pemasangan"
            required
          />

          <SelectField
            name="blockId"
            label="Lokasi Blok Lahan"
            options={[
              { label: 'Blok Naga Merah Super A1', value: 'BLK-NAGA-A1' },
              { label: 'Blok Naga Merah Super A2', value: 'BLK-NAGA-A2' },
              { label: 'Blok Naga Kuning Palora B1', value: 'BLK-NAGA-B1' },
              { label: 'Blok Naga Putih Organik B2', value: 'BLK-NAGA-B2' },
              { label: 'Blok Naga Hitam Eksperimen C1', value: 'BLK-NAGA-C1' },
            ]}
            required
          />

          <InputField
            name="technicianName"
            label="Teknisi Penanggung Jawab"
            placeholder="misal: Bambang Sutrisno"
            required
          />

          <InputField
            name="batchQuantity"
            type="number"
            label="Jumlah Salinan Label"
            placeholder="1"
            required
          />

          <InputField
            name="notes"
            label="Catatan Tambahan (Opsional)"
            placeholder="Instruksi penempelan outdoor..."
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={methods.formState.isSubmitting}
          >
            Generate Kode QR
          </Button>
        </FormWrapper>
      </CardContent>
    </Card>
  )
}
