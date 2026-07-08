import { supabase } from '@/lib/supabase'

export async function uploadProductImage(file: File) {
  const fileName = `${Date.now()}-${file.name}`

  const { data, error } = await supabase.storage
    .from('products')
    .upload(fileName, file)

  if (error) {
    throw error
  }

  const { data: publicUrl } = supabase.storage
    .from('products')
    .getPublicUrl(fileName)

  return publicUrl.publicUrl
}