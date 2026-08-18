"use client"

import { TelegramLogoIcon, WhatsappLogoIcon, ChatCircleIcon } from "@phosphor-icons/react"

export default function CTALinks() {
    return(
        <div className="md:ml-auto flex flex-row flex-wrap justify-start items-center gap-2">
            <li>
                <a className="text-sm text-muted-foreground flex flex-row gap-2 p-2 bg-secondary" href="/devocional/whatsapp" title="Devocional no WhatsApp" target="_blank">
                    <WhatsappLogoIcon size={20} />
                    WhatsApp
                </a>
            </li>
            <li>
                <a className="text-sm text-muted-foreground flex flex-row gap-2 p-2 bg-secondary" href="/devocional/telegram" title="Devocional no Telegram" target="_blank">
                    <TelegramLogoIcon size={20} />
                    Telegram
                </a>
            </li>
            <li>
                <a className="text-sm text-muted-foreground flex flex-row gap-2 p-2 bg-secondary" href="/devocional/signal" title="Devocional no Signal" target="_blank">
                    <ChatCircleIcon size={20} />
                    Signal
                </a>
            </li>
        </div>
    )
}