import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Icon } from '../../components/ui/Icon'
import { useWorkspace } from '../../app/context'
import { answerQuestion } from '../../lib/domain'
import type { Message } from '../../types'

export function AssistantDrawer({ onClose, question }: {onClose:()=>void;question?:string}) {
  const { current, navigate } = useWorkspace()
  const [input,setInput] = useState('')
  const [messages,setMessages] = useState<Message[]>(()=>[
    {id:'intro',role:'assistant',text:`Hola. Este es tu espacio para entender los datos de ${current.name}. ¿Qué te gustaría explorar? Las respuestas de esta demostración son guiadas; no hay un modelo de IA conectado.`},
    ...(question?[{id:'initial-user',role:'user' as const,text:question},{id:'initial-answer',role:'assistant' as const,text:answerQuestion(question,current)}]:[]),
  ])
  const lastMessage = useRef<HTMLDivElement>(null)
  useEffect(()=>{lastMessage.current?.scrollIntoView({behavior:'smooth',block:'nearest'})},[messages])
  function send(text:string) {
    if(!text.trim())return
    setMessages(previous=>[...previous,{id:crypto.randomUUID(),role:'user',text:text.trim()},{id:crypto.randomUUID(),role:'assistant',text:answerQuestion(text,current)}])
    setInput('')
  }
  function submit(event:FormEvent) {event.preventDefault();send(input)}
  return <Modal title="Conversa con Tarpu" onClose={onClose} className="assistant-drawer"><div className="assistant-context"><span className="agent-orbit"><img src="brand/tarpu-mark-white.png" alt=""/></span><div><strong>Una conversación sobre tu campo</strong><span><Icon name="pin" size={12}/>{current.name} <b>·</b> Respuestas guiadas</span></div></div><div className="chat-messages" role="log" aria-label="Conversación de demostración" aria-live="polite">{messages.map(message=><div className={`chat-message ${message.role}`} key={message.id}>{message.role==='assistant'&&<span className="message-avatar"><img src="brand/tarpu-mark-white.png" alt=""/></span>}<div><span className="message-author">{message.role==='assistant'?'Tarpu · demostración':'Tú'}</span><p>{message.text}</p>{message.role==='assistant'&&message.id!=='intro'&&<button className="text-button" onClick={()=>{navigate('data');onClose()}}>Revisar los datos <Icon name="arrow" size={13}/></button>}</div></div>)}<div ref={lastMessage}/></div><div className="chat-bottom"><div className="prompt-chips">{['¿Qué significa el NDVI?','¿De dónde vienen los datos?','¿Cómo exploro una rotación?'].map(prompt=><button key={prompt} onClick={()=>send(prompt)}>{prompt}<Icon name="plus" size={12}/></button>)}</div><form className="chat-form" onSubmit={submit}><label className="sr-only" htmlFor="agent-question">Pregunta al agente</label><input id="agent-question" value={input} onChange={e=>setInput(e.target.value)} maxLength={500} placeholder="¿Qué te gustaría comprender?" autoComplete="off"/><button type="submit" aria-label="Enviar pregunta" disabled={!input.trim()}><Icon name="send" size={19}/></button></form><p className="chat-disclaimer">Prototipo con respuestas locales. No emite recomendaciones agrícolas reales.</p></div></Modal>
}
