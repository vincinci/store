"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Disclosure, Menu, Transition, Popover } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  UserGroupIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/lib/store/cart";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const cartItems = useCart((state) => state.items);
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = session?.user?.role === "admin";
  const isAdminRoute = pathname?.startsWith("/admin");

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
  ];

  const adminNavigation = [
    { name: "Dashboard", href: "/admin", icon: ChartBarIcon },
    { name: "Products", href: "/admin/products", icon: CubeIcon },
    { name: "Orders", href: "/admin/orders", icon: ClipboardDocumentListIcon },
    { name: "Customers", href: "/admin/customers", icon: UserGroupIcon },
  ];

  // Mock notifications - replace with real data
  const notifications = [
    { id: 1, title: "New Order #1234", href: "/admin/orders/1234", read: false },
    { id: 2, title: "Low Stock Alert: Product XYZ", href: "/admin/products/xyz", read: false },
    { id: 3, title: "New Customer Registration", href: "/admin/customers", read: true },
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <Disclosure as="nav" className="bg-white shadow sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="text-2xl font-bold text-primary">
                    MTN Store
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {(isAdminRoute && isAdmin ? adminNavigation : navigation).map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                        pathname === item.href
                          ? "border-b-2 border-primary text-gray-900"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {item.icon && (
                        <item.icon
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      )}
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              {!isAdminRoute && (
                <div className="flex-1 max-w-lg px-4 hidden md:flex items-center">
                  <form onSubmit={handleSearch} className="w-full">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                        placeholder="Search products..."
                      />
                    </div>
                  </form>
                </div>
              )}

              <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                {!isAdminRoute && (
                  <Link
                    href="/cart"
                    className="relative rounded-full bg-white p-2 text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">View shopping cart</span>
                    <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
                    {cartItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                        {cartItems.length}
                      </span>
                    )}
                  </Link>
                )}

                {/* Notifications */}
                {session && (
                  <Popover className="relative">
                    <Popover.Button className="relative rounded-full bg-white p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                      {unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                          {unreadNotifications}
                        </span>
                      )}
                    </Popover.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.map((notification) => (
                            <Link
                              key={notification.id}
                              href={notification.href}
                              className={`block px-4 py-3 hover:bg-gray-50 ${
                                !notification.read ? "bg-blue-50" : ""
                              }`}
                            >
                              <p className={`text-sm text-gray-900 ${
                                !notification.read ? "font-semibold" : ""
                              }`}>
                                {notification.title}
                              </p>
                            </Link>
                          ))}
                        </div>
                        {notifications.length > 0 && (
                          <div className="border-t border-gray-100 px-4 py-2">
                            <button
                              className="text-sm text-primary hover:text-primary/80"
                              onClick={() => {/* Mark all as read */}}
                            >
                              Mark all as read
                            </button>
                          </div>
                        )}
                      </Popover.Panel>
                    </Transition>
                  </Popover>
                )}

                {session ? (
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                      <span className="sr-only">Open user menu</span>
                      <span className="inline-block h-8 w-8 overflow-hidden rounded-full bg-gray-100">
                        <svg
                          className="h-full w-full text-gray-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </span>
                    </Menu.Button>
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
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                          <p className="text-sm text-gray-500 truncate">{session.user?.email}</p>
                        </div>
                        {isAdmin && !isAdminRoute && (
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href="/admin"
                                className={`block px-4 py-2 text-sm text-gray-700 ${
                                  active ? "bg-gray-100" : ""
                                }`}
                              >
                                Admin Dashboard
                              </Link>
                            )}
                          </Menu.Item>
                        )}
                        {isAdminRoute && (
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href="/"
                                className={`block px-4 py-2 text-sm text-gray-700 ${
                                  active ? "bg-gray-100" : ""
                                }`}
                              >
                                Store Front
                              </Link>
                            )}
                          </Menu.Item>
                        )}
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/profile"
                              className={`block px-4 py-2 text-sm text-gray-700 ${
                                active ? "bg-gray-100" : ""
                              }`}
                            >
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        {!isAdminRoute && (
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href="/orders"
                                className={`block px-4 py-2 text-sm text-gray-700 ${
                                  active ? "bg-gray-100" : ""
                                }`}
                              >
                                Orders
                              </Link>
                            )}
                          </Menu.Item>
                        )}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => signOut()}
                              className={`block w-full px-4 py-2 text-left text-sm text-gray-700 ${
                                active ? "bg-gray-100" : ""
                              }`}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                  >
                    Sign in
                  </Link>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <Disclosure.Panel className="sm:hidden">
            {/* Mobile search */}
            {!isAdminRoute && (
              <div className="p-4 border-b border-gray-200">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                      placeholder="Search products..."
                    />
                  </div>
                </form>
              </div>
            )}

            {/* Mobile navigation */}
            <div className="space-y-1 pb-3 pt-2">
              {(isAdminRoute && isAdmin ? adminNavigation : navigation).map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className={`flex items-center py-2 pl-3 pr-4 text-base font-medium ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  {item.icon && (
                    <item.icon
                      className="mr-2 h-5 w-5"
                      aria-hidden="true"
                    />
                  )}
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>

            {/* Mobile profile section */}
            <div className="border-t border-gray-200 pb-3 pt-4">
              {session ? (
                <>
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <span className="inline-block h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                        <svg
                          className="h-full w-full text-gray-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        {session.user?.name}
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        {session.user?.email}
                      </div>
                    </div>
                    {/* Mobile notifications */}
                    <button
                      type="button"
                      className="relative ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500"
                    >
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                      {unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                          {unreadNotifications}
                        </span>
                      )}
                    </button>
                  </div>
                  <div className="mt-3 space-y-1">
                    {isAdmin && !isAdminRoute && (
                      <Disclosure.Button
                        as={Link}
                        href="/admin"
                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                      >
                        Admin Dashboard
                      </Disclosure.Button>
                    )}
                    {isAdminRoute && (
                      <Disclosure.Button
                        as={Link}
                        href="/"
                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                      >
                        Store Front
                      </Disclosure.Button>
                    )}
                    <Disclosure.Button
                      as={Link}
                      href="/profile"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Your Profile
                    </Disclosure.Button>
                    {!isAdminRoute && (
                      <Disclosure.Button
                        as={Link}
                        href="/orders"
                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                      >
                        Orders
                      </Disclosure.Button>
                    )}
                    <Disclosure.Button
                      as="button"
                      onClick={() => signOut()}
                      className="block w-full px-4 py-2 text-left text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Sign out
                    </Disclosure.Button>
                  </div>
                </>
              ) : (
                <div className="mt-3 space-y-1">
                  <Disclosure.Button
                    as={Link}
                    href="/auth/signin"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Sign in
                  </Disclosure.Button>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
