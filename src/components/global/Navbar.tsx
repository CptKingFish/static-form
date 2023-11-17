import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/20/solid";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { classNames } from "@/lib/helpers";

export default function Navbar() {
  const { data: sessionData } = useSession();
  return (
    <nav className="bg-white shadow">
      <>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Image
                  className="h-8 w-auto"
                  height={500}
                  width={500}
                  src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                  alt="Your Company"
                />
              </div>
              <div className="ms-3 flex items-center md:ml-6 md:space-x-8">
                <button
                  type="button"
                  className="relative inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                  New Form
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <div className="md:ml-4 md:flex md:flex-shrink-0 md:items-center">
                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    {sessionData ? (
                      <Menu.Button className="relative flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        <span className="absolute -inset-1.5" />
                        <span className="sr-only">Open user menu</span>
                        {sessionData?.user?.image ? (
                          <Image
                            className="h-12 w-12 rounded-full"
                            height={500}
                            width={500}
                            src={sessionData.user?.image}
                            alt=""
                          />
                        ) : (
                          <Image
                            className="h-12 w-12 rounded-full"
                            height={500}
                            width={500}
                            src={
                              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                            }
                            alt=""
                          />
                        )}
                      </Menu.Button>
                    ) : (
                      <button
                        type="button"
                        className="rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        onClick={() => void signIn()}
                      >
                        Sign in
                      </button>
                    )}
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="m-3">
                        {sessionData && <span>{sessionData.user?.name}</span>}
                      </div>
                      <Menu.Item>
                        <button
                          type="button"
                          className="w-full rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-gray-300 hover:bg-gray-50"
                          onClick={() => void signOut()}
                        >
                          Sign out
                        </button>
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>
        </div>
      </>
    </nav>
  );
}
