import { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Sparkles } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { scanFolder, organizeFiles, undoFiles } from './services/api';
import Sidebar from './components/Sidebar';
import StatsCards from './components/StatsCards';
import FileTable from './components/FileTable';

export default function App(){
  const [folder,setFolder]=useState(''); const [data,setData]=useState(null); const [loading,setLoading]=useState(false);
  const handleScan=async()=>{try{setLoading(true);const res=await scanFolder(folder);setData(res.data);toast.success('Scan complete');}catch(e){toast.error(e?.response?.data?.detail||'Scan failed');}finally{setLoading(false)}};
  const handleOrganize=async()=>{try{await organizeFiles(folder);toast.success('Files organized');await handleScan();}catch{toast.error('Organize failed')}};
  const handleUndo=async()=>{try{await undoFiles();toast.success('Undo complete');await handleScan();}catch{toast.error('Undo failed')}};
  return <div className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white p-6'><Toaster/>
    <div className='max-w-7xl mx-auto grid md:grid-cols-[220px_1fr] gap-6'>
      <Sidebar/>
      <main className='space-y-5'>
        <motion.section initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className='glass rounded-2xl p-6'>
          <h1 className='text-3xl font-bold flex items-center gap-2'><Sparkles className='text-cyan-300'/> Smart File Organizer + AI Suggestions</h1>
          <p className='text-slate-300 mt-2'>Scan folders, detect clutter, and auto-organize with startup-grade UX.</p>
          <div className='mt-4 flex gap-3 flex-wrap'>
            <input value={folder} onChange={e=>setFolder(e.target.value)} placeholder='Paste absolute folder path...' className='bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 min-w-[320px]' />
            <button onClick={handleScan} className='bg-cyan-500 px-4 py-2 rounded-lg text-black font-semibold flex gap-2'><FolderOpen/>Scan</button>
            <button onClick={handleOrganize} className='bg-emerald-500 px-4 py-2 rounded-lg text-black font-semibold'>Organize</button>
            <button onClick={handleUndo} className='bg-amber-400 px-4 py-2 rounded-lg text-black font-semibold'>Undo</button>
          </div>{loading&&<div className='mt-3 h-2 bg-slate-700 rounded'><div className='h-2 bg-cyan-400 rounded w-2/3 animate-pulse'/></div>}
        </motion.section>
        <StatsCards stats={data?{...data.stats,duplicate_count:data.insights?.duplicate_count}:null}/>
        <section className='grid lg:grid-cols-2 gap-4'>
          <div className='glass rounded-xl p-4'><h3 className='font-semibold mb-3'>AI Suggestions</h3>{data?.ai_suggestions?.map(s=><div key={s.title} className='mb-2 p-3 rounded bg-slate-900 border border-slate-700'><p className='font-medium'>{s.title}</p><p className='text-slate-400 text-sm'>{s.detail}</p></div>) || <p className='text-slate-400'>Run a scan to see recommendations.</p>}</div>
          <div className='glass rounded-xl p-4'><h3 className='font-semibold mb-3'>Category Distribution</h3>{Object.entries(data?.stats?.category_distribution||{}).map(([k,v])=><p key={k} className='text-slate-300 text-sm'>{k}: {v}</p>)}</div>
        </section>
        <FileTable files={data?.files||[]}/>
      </main>
    </div>
  </div>
}
