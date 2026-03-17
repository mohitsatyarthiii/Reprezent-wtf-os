import { createClient } from '@/lib/supabase/client'

export async function uploadFile(file, userId, folder = 'general') {
  try {
    const supabase = createClient()
    
    // Create unique file path: user_id/folder/timestamp_filename
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}_${file.name.replace(/\s+/g, '_')}`
    const filePath = `${userId}/${folder}/${fileName}`
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('knowledge-base')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) throw error
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('knowledge-base')
      .getPublicUrl(filePath)
    
    // Format file size
    const fileSize = formatFileSize(file.size)
    
    // Get file type
    const fileType = getFileType(file.name)
    
    return {
      success: true,
      fileUrl: publicUrl,
      fileName: file.name,
      fileSize,
      fileType,
      storagePath: filePath
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteFile(storagePath) {
  try {
    const supabase = createClient()
    
    const { error } = await supabase.storage
      .from('knowledge-base')
      .remove([storagePath])
    
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error deleting file:', error)
    return { success: false, error: error.message }
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function getFileType(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  const types = {
    pdf: 'PDF',
    doc: 'DOC',
    docx: 'DOCX',
    txt: 'TXT',
    md: 'MD',
    jpg: 'JPG',
    jpeg: 'JPEG',
    png: 'PNG',
    gif: 'GIF',
    xls: 'XLS',
    xlsx: 'XLSX',
    ppt: 'PPT',
    pptx: 'PPTX'
  }
  return types[ext] || 'FILE'
}