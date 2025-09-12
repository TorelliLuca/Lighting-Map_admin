"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useUser } from "../../context/UserContext"
import { User, LogOut, Settings, Bell, Search } from "lucide-react"
import { GlassCard } from "../ui/glass-card"
import logoIcon from "../../assets/faviconWhite.png"

const mockNotifications = [
	{
		id: 1,
		title: "Nuova richiesta di manutenzione",
		description: "È stata segnalata una nuova richiesta.",
		isNew: true,
		date: "03/09/2025 10:12",
	},
	{
		id: 2,
		title: "Aggiornamento sistema",
		description: "Il sistema è stato aggiornato con successo.",
		isNew: false,
		date: "02/09/2025 18:45",
	},
	{
		id: 3,
		title: "Nuovo utente registrato",
		description: "Mario Rossi ha completato la registrazione.",
		isNew: true,
		date: "03/09/2025 09:30",
	},
	{
		id: 4,
		title: "Nuovo utente registrato",
		description: "Mario Rossi ha completato la registrazione.",
		isNew: true,
		date: "03/09/2025 09:30",
	},
	{
		id: 5,
		title: "Nuovo utente registrato",
		description: "Mario Rossi ha completato la registrazione.",
		isNew: true,
		date: "03/09/2025 09:30",
	},
	{
		id: 6,
		title: "Nuovo utente registrato",
		description: "Mario Rossi ha completato la registrazione.",
		isNew: true,
		date: "03/09/2025 09:30",
	},
]

const fetchNotifications = async () => {
	// Qui va la chiamata API, per ora mock
	// const response = await fetch("/api/notifications")
	// return await response.json()
	return mockNotifications
}

const Navbar = () => {
	const { userData, logout } = useUser()
	const [userMenuOpen, setUserMenuOpen] = useState(false)
	const [searchFocused, setSearchFocused] = useState(false)
	const [notifOpen, setNotifOpen] = useState(false)
	const [notifications, setNotifications] = useState([])
	const [loadingNotif, setLoadingNotif] = useState(false)

	useEffect(() => {
		const loadNotifications = async () => {
			setLoadingNotif(true)
			const notifs = await fetchNotifications()
			setNotifications(notifs)
			setLoadingNotif(false)
		}
		loadNotifications()
	}, [])

	const hasNewNotifications = notifications.some((n) => n.isNew)

	const handleNotifOpen = () => {
		setNotifOpen(!notifOpen)
		// Qui puoi aggiungere la logica per segnare come lette le notifiche
		// setNotifications(prev => prev.map(n => ({ ...n, isNew: false })))
	}

	return (
		<nav className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-2xl border-b border-slate-700/50">
			<div className="max-w-full mx-auto px-6 lg:px-8">
				<div className="flex items-center justify-between h-20 ">
					{/* Logo */}
					<Link to="/" className="xl:hidden items-center space-x-3  hidden">
						<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
							<img
								src={logoIcon || "/placeholder.svg"}
								alt="Icon"
								className="w-6 h-6"
							/>
						</div>
						<div>
							<h1 className="text-xl font-bold text-white">Lighting-Map</h1>
							<p className="text-xs text-slate-400 -mt-1">Admin Platform</p>
						</div>
					</Link>

					{/* Right Section */}
					<div className="flex items-center space-x-4">
						{/* Notifications */}
						<div className="relative">
							<button
								className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-slate-800/50"
								onClick={handleNotifOpen}
							>
								<Bell className="h-5 w-5" />
								{hasNewNotifications && (
									<span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
								)}
							</button>
							<AnimatePresence>
								{notifOpen && (
									<motion.div
										initial={{ opacity: 0, scale: 0.95, y: -10 }}
										animate={{ opacity: 1, scale: 1, y: 0 }}
										exit={{ opacity: 0, scale: 0.95, y: -10 }}
										transition={{ duration: 0.15 }}
										className="absolute right-0 mt-2 w-80 origin-top-right"
									>
										<GlassCard variant="default" className="py-2 bg-slate-900/100">
											<div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
												<span className="text-sm font-semibold text-white">
													Notifiche
												</span>
												{loadingNotif && (
													<span className="text-xs text-slate-400">
														Caricamento...
													</span>
												)}
											</div>
											<div className="max-h-64 overflow-y-auto">
												{notifications.length === 0 && !loadingNotif && (
													<div className="px-4 py-6 text-center text-slate-400 text-sm">
														Nessuna notifica
													</div>
												)}
												{notifications.map((n) => (
													<div
														key={n.id}
														className={`px-4 py-3 border-b border-slate-700/30 last:border-b-0 transition-colors ${
															n.isNew
																? "bg-blue-900/30 border-l-4 border-blue-500"
																: "hover:bg-slate-800/40"
														}`}
													>
														<div className="flex justify-between items-center">
															<span
																className={`font-medium flex items-center gap-2 ${
																	n.isNew
																		? "text-white"
																		: "text-slate-300"
																}`}
															>
																{n.title}
																{n.isNew && (
																	<span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
																)}
															</span>
														</div>
														<p className="text-xs text-slate-400 mt-1">
															{n.description}
														</p>
														<p className="text-[10px] text-slate-500 mt-1">
															{n.date}
														</p>
													</div>
												))}
											</div>
										</GlassCard>
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						{/* User Menu */}
						<div className="relative">
							<button
								onClick={() => setUserMenuOpen(!userMenuOpen)}
								className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors"
							>
								<div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-semibold border border-slate-600/50">
									{userData?.name?.charAt(0)}
									{userData?.surname?.charAt(0)}
								</div>
								<div className="hidden lg:block text-left">
									<p className="text-sm font-semibold text-white">
										{userData?.name} {userData?.surname}
									</p>
									<p className="text-xs text-slate-400">
										{userData?.user_type === "SUPER_ADMIN"
											? "Super Admin"
											: userData?.user_type === "ADMINISTRATOR"
											? "Amministratore"
											: userData?.user_type === "MAINTAINER"
											? "Manutentore"
											: "Utente"}
									</p>
								</div>
							</button>

							<AnimatePresence>
								{userMenuOpen && (
									<motion.div
										initial={{ opacity: 0, scale: 0.95, y: -10 }}
										animate={{ opacity: 1, scale: 1, y: 0 }}
										exit={{ opacity: 0, scale: 0.95, y: -10 }}
										transition={{ duration: 0.15 }}
										className="absolute right-0 mt-2 w-64 origin-top-right"
									>
										<GlassCard variant="elevated" className="py-2">
											<div className="px-4 py-3 border-b border-slate-700/50">
												<p className="text-sm font-medium text-white">
													{userData?.name} {userData?.surname}
												</p>
												<p className="text-xs text-slate-400">
													{userData?.email}
												</p>
											</div>

											<div className="py-2">
												<Link
													to="/profile"
													className="flex items-center px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
													onClick={() => setUserMenuOpen(false)}
												>
													<User className="mr-3 h-4 w-4" />
													Profilo
												</Link>
												<Link
													to="/settings"
													className="flex items-center px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
													onClick={() => setUserMenuOpen(false)}
												>
													<Settings className="mr-3 h-4 w-4" />
													Impostazioni
												</Link>
											</div>

											<div className="border-t border-slate-700/50 py-2">
												<button
													onClick={() => {
														setUserMenuOpen(false)
														logout()
													}}
													className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
												>
													<LogOut className="mr-3 h-4 w-4" />
													Logout
												</button>
											</div>
										</GlassCard>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</div>
		</nav>
	)
}

export default Navbar
