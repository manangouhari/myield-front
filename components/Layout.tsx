"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import React from "react";
import { WagmiConfig, createConfig } from "wagmi";
import {
  ConnectKitProvider,
  ConnectKitButton,
  getDefaultConfig,
} from "connectkit";
import { moonbeam } from "wagmi/chains";

import { ChartPieIcon, FolderIcon } from "@heroicons/react/24/outline";

import { Toaster } from "react-hot-toast";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  console.log(pathname);

  const navigation = [
    { name: "Home", href: "/", icon: ChartPieIcon, current: pathname === "/" },
    {
      name: "iBTC Yield",
      href: "/ibtc",
      icon: ChartPieIcon,
      current: pathname.includes("ibtc"),
    },
    {
      name: "USDC Yield",
      href: "/usdc-yield",
      icon: FolderIcon,
      current: pathname.includes("usdc"),
    },
  ];

  const config = createConfig(
    getDefaultConfig({
      appName: "moonyield",
      chains: [moonbeam],
      walletConnectProjectId: "2626327116088e13013504b2d4b5276a",
    })
  );

  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider theme="minimal">
        <div className="h-screen overflow-hidden">
          <div>
            <Toaster />
          </div>
          <div className="fixed inset-y-0 z-50 flex w-72 flex-col">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-slate-50 px-6 pb-4">
              <div className="flex h-16 shrink-0 items-center">
                {/* <img
                  className="h-8 w-auto"
                  src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                  alt="Your Company"
                /> */}
                <h1 className="text-xl font-bold">MYield</h1>
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={classNames(
                              item.current
                                ? "bg-gray-50 text-indigo-600"
                                : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
                              "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                            )}
                          >
                            {/* <item.icon
                              className={classNames(
                                item.current
                                  ? "text-indigo-600"
                                  : "text-gray-400 group-hover:text-indigo-600",
                                "h-6 w-6 shrink-0"
                              )}
                              aria-hidden="true"
                            /> */}
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          <div className="pl-72 border-b bg-slate-50">
            <div className="ml-auto px-8 py-4 flex justify-end">
              <ConnectKitButton />
            </div>
          </div>
          <main className="pl-72 py-10  h-full overflow-y-auto">
            <div className="mx-auto max-w-7xl px-8 pb-16">{children}</div>
          </main>
        </div>
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

export default Layout;
