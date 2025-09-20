import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export interface StudentData {
  id: string
  name: string
  height?: number
  weight?: number
  heartRate?: number
  totalScore: number
  groupId: string
  groupName?: string
  scoreRecords?: Array<{
    points: number
    reason: string
    createdAt: string
  }>
}

export interface GroupData {
  id: string
  name: string
  description?: string
  teacherId: string
  students: StudentData[]
}

// 导出学生数据到Excel
export const exportStudentsToExcel = (groups: GroupData[]) => {
  try {
    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    
    // 为每个班级创建工作表
    groups.forEach((group) => {
      const worksheetData = [
        ['姓名', '身高(cm)', '体重(kg)', '心率(bpm)', '总积分', '积分记录'],
        ...group.students.map(student => [
          student.name,
          student.height || '',
          student.weight || '',
          student.heartRate || '',
          student.totalScore,
          student.scoreRecords?.map(record => 
            `${record.points > 0 ? '+' : ''}${record.points}分 (${record.reason})`
          ).join('; ') || ''
        ])
      ]
      
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
      
      // 设置列宽
      const colWidths = [
        { wch: 10 }, // 姓名
        { wch: 8 },  // 身高
        { wch: 8 },  // 体重
        { wch: 8 },  // 心率
        { wch: 8 },  // 总积分
        { wch: 30 }  // 积分记录
      ]
      worksheet['!cols'] = colWidths
      
      // 添加工作表到工作簿
      XLSX.utils.book_append_sheet(workbook, worksheet, group.name)
    })
    
    // 生成Excel文件
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    // 下载文件
    const fileName = `学生数据_${new Date().toISOString().split('T')[0]}.xlsx`
    saveAs(data, fileName)
    
    return true
  } catch (error) {
    console.error('导出Excel失败:', error)
    return false
  }
}

// 从Excel文件导入学生数据
export const importStudentsFromExcel = (file: File): Promise<StudentData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        const students: StudentData[] = []
        
        // 遍历所有工作表
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          
          // 跳过标题行，从第二行开始处理数据
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[]
            if (row[0]) { // 确保姓名不为空
              const student: StudentData = {
                id: `imported_${Date.now()}_${i}`,
                name: row[0] || '',
                height: row[1] ? Number(row[1]) : undefined,
                weight: row[2] ? Number(row[2]) : undefined,
                heartRate: row[3] ? Number(row[3]) : undefined,
                totalScore: row[4] ? Number(row[4]) : 0,
                groupId: `imported_group_${sheetName}`,
                groupName: sheetName
              }
              students.push(student)
            }
          }
        })
        
        resolve(students)
      } catch (error) {
        reject(new Error('解析Excel文件失败'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('读取文件失败'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

// 导出积分记录到Excel
export const exportScoreRecordsToExcel = (groups: GroupData[]) => {
  try {
    const workbook = XLSX.utils.book_new()
    
    groups.forEach((group) => {
      const allRecords: any[] = []
      
      group.students.forEach(student => {
        if (student.scoreRecords && student.scoreRecords.length > 0) {
          student.scoreRecords.forEach(record => {
            allRecords.push({
              '班级': group.name,
              '学生姓名': student.name,
              '积分变化': record.points,
              '原因': record.reason,
              '时间': new Date(record.createdAt).toLocaleString('zh-CN')
            })
          })
        }
      })
      
      if (allRecords.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(allRecords)
        XLSX.utils.book_append_sheet(workbook, worksheet, `${group.name}_积分记录`)
      }
    })
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    const fileName = `积分记录_${new Date().toISOString().split('T')[0]}.xlsx`
    saveAs(data, fileName)
    
    return true
  } catch (error) {
    console.error('导出积分记录失败:', error)
    return false
  }
}
