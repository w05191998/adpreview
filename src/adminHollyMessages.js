const DAY_MESSAGES = [
  '⏱️ 60 seconds passed while you were still working. The grind respects you.',
  '☕ Your coffee is getting cold but these ad previews are heating up.',
  '🦥 Productivity is a mindset. So is pretending this ticker is urgent.',
  '📊 Three spreadsheets cried today. You did not. Legend behavior.',
  '🌞 The sun moved 0.0001°. Keep going, you radiant admin.',
  '🐢 Slow is smooth. Smooth is fast. Fast is another browser tab.',
  '🎉 Someone in UTC+2 just ate lunch. You are serving main-character energy.',
  '🛋️ 45 seconds of screen stare = deep strategic thinking. Trust the process.',
  '🌈 Your aura today: aggressively competent with a side of sparkle.',
  '🚀 Blast off in T-minus… whenever you pick a client workspace.',
  '🧘 Breathe in. Breathe out. Pick a client. Exhale like a boss.',
  '🕐 It has been at least one minute somewhere. Probably here too.',
  '🏆 You unlocked: Opened the tool without closing it immediately.',
  '🌴 Mental vacation: 5 seconds. Physical desk: still fabulous.',
  '📝 Status update: crushing it softly but with confidence.',
  '🛸 Aliens have not contacted us yet. Your previews still slay though.',
  '🥐 A croissant in Paris just got flaky. You get things done.',
  '✨ Random fact: you are doing better than yesterday’s you.',
  '💻 System warning: User might be slightly on99 today. (sun fu la)',
  '💪 You survived another meeting. Very lek.',
  '🚨 Client being annoying? Calling police.....',
  '💡 Fun fact: You just realized your jaw is tense. Relax it la.',
  '💡 Fun fact: 60 seconds passed in your office, 1 minute passed in Africa.',
  '💡 Fun fact: Reading this loading message just burned exactly 0.5 calories. Athletic.',
  '💡 Fun fact: If you wait long enough, it will be tomorrow.',
  '💡 Fun fact: You are currently the youngest you will ever be for the rest of your life.',
  '💡 Fun fact: Water is wet. You are tired. Drink water ah diu.',
  '🌪️ Another day, another chur. U got this.',
  '🚰 Stop staring at the screen and drink some water first ah.',
  '🧘 Breathe in. Breathe out. Do not scold the client (yet).',
  '🐌 Loading... but probably still faster than your office WiFi.',
  '🥔 My brain is currently operating at potato capacity. Same here.',
  '🚶‍♂️ You have walked exactly 0 steps in the last hour. Very healthy.',
  '📈 Every time you sigh, a spreadsheet gets its borders.',
  '🏆 You unlocked a new achievement: Pretending to look busy.',
  '☀️ Sun is shining, birds are singing, and you are staring at a progress bar.',
]

const NIGHT_MESSAGES = [
  '🍟 Still no time for dinner? Eat M kee later.',
  '🌙 Night shift energy activated. Top sum.',
  '🌙 Night shift energy even if it is 2pm. We do not judge.',
  '💡 Fun fact: Coffee at this hour is no longer energy. It is just liquid anxiety.',
  '💡 Fun fact: There are 24 hours in a day. You do not have to work all of them.',
  '💡 Fun fact: Your dark circles are now officially visible from space.',
  '💡 Fun fact: Staring at a loading bar is legally considered meditation after 9 PM.',
  '💡 Fun fact: Tomorrow is just today’s sequel. It probably sucks too. Go sleep.',
  '💡 Fun fact: The server doesn’t care about your OT. It wants to sleep too.',
  '💡 Fun fact: You can always quit and sell sweet potatoes on the street.',
  '💸 OT again? Remember to claim your taxi fee.',
  '👀 I see you zoning out. Wake up and finish it la.',
  '🛑 Error 404: Motivation not found. Please reboot yourself.',
  '🎯 Focus mode. Let’s get this done and go home.',
  '🔋 Battery low. Oh wait, that is your physical energy.',
  '🦇 Vampires do not work this late. Why are you?',
  '🛌 Your bed misses you. It told me.',
  '🚪 System update: Go home la diu.',
  '🚕 If you finish this now, you can still catch a normal bus. If not, Uber time.',
  '🥱 Staring at the screen will not make the work finish itself. Sadly.',
  '💤 Sleep is a free trial of death. Go get a trial.',
  '🧠 Brain empty? Same. Just click something and hope it works.',
  '🍔 Clients are temporary, junk food is forever.',
  '📋 Status update: Still alive and kicking. Good job.',
  '🏁 Loading the final boss... wait no, it is just another task.',
  '🖥️ Even the server wants to sleep. Be quick.',
  '👻 The ghosts in the office are judging your posture right now.',
  '⏳ Every 60 seconds you OT, you lose a minute of your life.',
]

export function isDayTime(date = new Date()) {
  const currentHour = date.getHours()
  return currentHour >= 6 && currentHour < 19
}

export function getHollyMessages(date = new Date()) {
  return isDayTime(date) ? DAY_MESSAGES : NIGHT_MESSAGES
}

export function pickRandomHollyMessage(date = new Date()) {
  const messages = getHollyMessages(date)
  const index = Math.floor(Math.random() * messages.length)
  return messages[index]
}
