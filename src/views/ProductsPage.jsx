import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import {
  BadgeCheck,
  Headphones,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  Truck,
  Zap,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useProductsContext } from "../context/ProductsContext";

import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import { SortDropdown } from "../components/SortDropdown";
import ProductCard from "../components/ProductCard";
import ResultsSummary from "../components/ResultsSummary";

const heroSlides = [
  { image: "/hero-banner.png",         href: "/?section=featured" },
  { image: "/banners/flash-sale.png",  href: "/?section=best-sellers" },
  { image: "/banners/gaming.png",      href: "/?category=Gaming" },
  { image: "/hero-banner3.png",        href: "/?category=Phones%20%26%20Tablets" },
];

const trustItems = [
  { title: "Secure Payment", image: "/secure.png" },
  { title: "Genuine Products", image: "/genuine.png" },
  { title: "Fast Delivery", image: "/delivery.png" },
  { title: "Warranty", image: "/warranty.png" },
  { title: "24/7 Support", image: "/customer-services.png" },
];

const brandLogos = [
  { name: "Samsung", image: "/samsung.png" },
  { name: "Hisense", image: "/hisense.png" },
   { name: "sako", image: "/sako.webp" },
  { name: "itel", image: "/itel.png" },
  { name: "felicity", image: "/felicity.png" },
  { name: "deye", image: "/deye.jpg" },
];

const categoryBanners = [
  { name: "Inverter & Battery",       image: "/banners/solar-b.png",          href: "/?category=Inverter%20%26%20Battery" },
  { name: "Solar Panels",             image: "/banners/solar11.png",           href: "/?category=Solar%20Panels" },
  { name: "Televisions",              image: "/banners/tv.png",                href: "/?category=Televisions" },
  { name: "Air Conditioners",         image: "/banners/ac11.png",              href: "/?category=Air%20Conditioners" },
  { name: "Refrigerators",            image: "/banners/refrigerator11.png",    href: "/?category=Refrigerators" },
  { name: "Freezers",                 image: "/banners/freezer11.png",         href: "/?category=Freezers" },
  { name: "Washing Machines",         image: "/banners/washing-machine11.png", href: "/?category=Washing%20Machines" },
  { name: "Generators",               image: "/banners/generator.png",         href: "/?category=Generators" },
  { name: "Kitchen Appliances",       image: "/banners/kitchen11.png",         href: "/?category=Kitchen%20Appliances" },
  { name: "Home & Office Appliances", image: "/banners/home-appliances.png",   href: "/?category=Home%20%26%20Office%20Appliances" },
  { name: "Gaming",                   image: "/banners/gaming11.png",          href: "/?category=Gaming" },
  { name: "Phones & Tablets",         image: "/banners/phone11.png",           href: "/?category=Phones%20%26%20Tablets" },
  { name: "Computing",                image: "/banners/laptop11.png",          href: "/?category=Computing" },
  { name: "Audio & Accessories",      image: "/banners/audio11.png",           href: "/?category=Audio%20%26%20Accessories" },
  { name: "Electronics & Gadgets",    image: "/banners/electronics.png",       href: "/?category=Electronics%20%26%20Gadgets" },
];

const sectionBanners = {
  "new-arrivals": {
    image: "/banners/new-arrival11.png"
  },
  "featured": {
    image: "/banners/featured-product.png"
  },
  "best-sellers": {
    image: "/banners/solar11.png"
}
};

const faqs = [
  { question: "How fast is delivery?", answer: "Ibadan orders can be arranged quickly after confirmation. Nationwide delivery timelines depend on destination and item size." },
  { question: "Are the products genuine?", answer: "Uptora highlights genuine products and provides support details so you can shop with confidence." },
  { question: "Can I pay securely online?", answer: "Yes. Checkout uses Paystack for card, transfer, USSD and supported Nigerian payment options." },
  { question: "What is the return policy?", answer: "Returns are handled on a case-by-case basis. Contact us via WhatsApp if you have any issues with your order." },
  { question: "Do you offer warranty?", answer: "Yes, most products come with manufacturer warranty. Specific warranty details are provided for each product." },
];

function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
      <div>
        <p className="mb-1 text-xs font-black uppercase tracking-[0.16em] text-brand-600">
          {eyebrow}
        </p>
        <h2 className="text-xl font-black text-gray-950 sm:text-2xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function ProductRail({ title, eyebrow, items, onAddToCart, onViewAll }) {
  if (items.length === 0) return null;
  return (
    <section className="py-6 sm:py-8">
      <SectionHeader eyebrow={eyebrow} title={title} action={onViewAll} />
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((product, index) => (
          <div key={`${product.id}-${index}-${title}`} className="relative flex-shrink-0 w-48 sm:w-56">
            <ProductCard product={product} onAddToCart={onAddToCart} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductsPage() {
  const router = useRouter();
  const {
    filteredProducts,
    categories,
    searchQuery,
    selectedCategory,
    sortOrder,
    minRating,
    setSearchQuery,
    setSelectedCategory,
    setSortOrder,
    setMinRating,
    addToCart,
  } = useProductsContext();

  const [routeSection, setRouteSection] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [dbCategories, setDbCategories] = useState([]);

  const [flashId, setFlashId] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [sectionProducts, setSectionProducts] = useState(null);

  // Fetch categories from MongoDB
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setDbCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }
    fetchCategories();
  }, []);

  // Create categoryCopy from fetched categories
  const categoryCopy = useMemo(() => {
    const copy = { All: { image: "/hero-banner.png" } };
    dbCategories.forEach(cat => {
      copy[cat.name] = { image: cat.image || "/hero-banner.png" };
    });
    return copy;
  }, [dbCategories]);

  const hero = categoryCopy[selectedCategory] || categoryCopy.All;
  const homepageMode = selectedCategory === "All" && !searchQuery && !routeSection;

  useEffect(() => {
    if (!router.isReady) return;

    const { category, section, ids } = router.query;
    const sectionValue = typeof section === "string" && section ? section : null;

    if (typeof category === "string" && category) {
      setSelectedCategory(category);
    } else if (!sectionValue) {
      setSelectedCategory("All");
      setSearchQuery("");
      setSortOrder("default");
      setMinRating(0);
      setSectionProducts(null);
    }

    if (sectionValue) {
      // Fetch products based on section type
      async function fetchSectionProducts() {
        try {
          let endpoint = "/api/products";
          if (sectionValue === "featured") endpoint = "/api/products/featured";
          else if (sectionValue === "best-sellers") endpoint = "/api/products/bestsellers";
          else if (sectionValue === "new-arrivals") endpoint = "/api/products/new-arrivals";
          
          const response = await fetch(endpoint, { cache: 'no-store' });
          if (response.ok) {
            const data = await response.json();
            setSectionProducts(data.products || []);
          } else {
            setSectionProducts([]);
          }
        } catch (error) {
          console.error("Error fetching section products:", error);
          setSectionProducts([]);
        }
      }
      fetchSectionProducts();
      setSelectedCategory("All");
      setSearchQuery("");
    } else {
      setSectionProducts(null);
    }

    setRouteSection(sectionValue);
  }, [router.isReady, router.query.category, router.query.section, router.query.ids, setSelectedCategory, setSearchQuery, filteredProducts]);

  // Fetch featured products from API
  useEffect(() => {
    async function fetchFeatured() {
      try {
        const response = await fetch("/api/products/featured?limit=4", {
          cache: 'no-store'
        });
        if (response.ok) {
          const data = await response.json();
          setFeaturedProducts(data.products || []);
        } else {
          setFeaturedProducts([]);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
        setFeaturedProducts([]);
      } finally {
        setLoadingFeatured(false);
      }
    }
    
    if (homepageMode) {
      fetchFeatured();
    }
  }, [homepageMode]);

  // Fetch best sellers from API
  useEffect(() => {
    async function fetchBestSellers() {
      try {
        const response = await fetch("/api/products/bestsellers?limit=4", {
          cache: 'no-store'
        });
        if (response.ok) {
          const data = await response.json();
          setBestSellers(data.products || []);
        } else {
          setBestSellers([]);
        }
      } catch (error) {
        console.error("Error fetching best sellers:", error);
        setBestSellers([]);
      }
    }
    
    if (homepageMode) {
      fetchBestSellers();
    }
  }, [homepageMode]);

  // Fetch new arrivals from API
  useEffect(() => {
    async function fetchNewArrivals() {
      try {
        const response = await fetch("/api/products/new-arrivals?limit=4", {
          cache: 'no-store'
        });
        if (response.ok) {
          const data = await response.json();
          setNewArrivals(data.products || []);
        } else {
          setNewArrivals([]);
        }
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
        setNewArrivals([]);
      }
    }
    
    if (homepageMode) {
      fetchNewArrivals();
    }
  }, [homepageMode]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const categoryTiles = dbCategories.map(cat => cat.name);

  function handleAddToCart(product) {
    addToCart(product);
    setFlashId(product.id);
    setTimeout(() => setFlashId(null), 1400);
  }

  function handleReset() {
    setSearchQuery("");
    setSelectedCategory("All");
    setSortOrder("default");
    setMinRating(0);
  }

  function handleViewAll(section) {
    // Navigate to products page with section filter
    router.push({ pathname: "/", query: { section } });
  }

  return (
    <>
      <Head>
        <title>Uptora Electronics — Genuine Electronics in Ibadan, Nigeria</title>
        <meta name="description" content="Shop TVs, ACs, Solar panels, inverters, phones, laptops and more at Uptora Electronics. Fast delivery in Ibadan and across Nigeria. Secure payments via Paystack." />
        <meta name="keywords" content="electronics Ibadan, buy TV Nigeria, solar panels Ibadan, inverter battery Nigeria, phones laptops Nigeria, Uptora Electronics" />
        <meta property="og:title" content="Uptora Electronics — Genuine Electronics in Ibadan" />
        <meta property="og:description" content="Nigeria's trusted electronics store. TVs, ACs, Solar, Inverters, Phones and more." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://uptora-electronics.vercel.app" />
        <meta property="og:image" content="https://uptora-electronics.vercel.app/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://uptora-electronics.vercel.app" />
      </Head>
      <div className="bg-gray-50 text-gray-950 z-[50]">
      {/* Hero Section */}
      {selectedCategory === "All" && !searchQuery && !router.query.section ? (
        <div 
          className="relative h-[220px] sm:h-[320px] md:h-[420px] lg:h-[500px] overflow-hidden group"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {heroSlides.map((slide, index) => (
            <Link
              key={index}
              href={slide.href}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={slide.image}
                alt={`Uptora Electronics offer ${index + 1}`}
                className="h-full w-full object-cover object-center"
                draggable={false}
              />
            </Link>
          ))}
          
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-brand-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg hover:bg-brand-600 hidden sm:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-brand-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg hover:bg-brand-600 hidden sm:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          
          {/* Slider Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Slide ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-brand-500 w-7'
                    : 'bg-white/60 w-2 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Category Pill Bar */}
      

      <main className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pb-20 lg:px-8">
        <section className="-mt-6 grid grid-cols-3 gap-4 sm:grid-cols-5">
          {trustItems.map((trust, index) => (
            <div key={index} className="flex flex-col items-center rounded-lg ">
              <img src={trust.image} alt={trust.title} className="h-20 w-20 object-contain" />
              <span className="text-xs text-gray-600 text-center mt-2">{trust.title}</span>
            </div>
          ))}
        </section>

        {homepageMode && (
          <>
            <ProductRail 
              title="New Arrivals" 
              items={newArrivals} 
              onAddToCart={handleAddToCart}
              onViewAll={<button onClick={() => handleViewAll("new-arrivals")} className="text-sm  font-bold text-brand-600 hover:text-brand-700">View all →</button>}
            />
            
            {/* Category Showcase */}
            <section className="py-6 sm:py-8">
              <SectionHeader
                title="Shop by Category"
                action={null}
              />
              <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
                {categoryBanners.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    className="group relative flex-shrink-0 w-[160px] sm:w-[200px] md:w-[220px] rounded-xl overflow-hidden cursor-pointer border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="h-[130px] sm:h-[160px] w-full overflow-hidden">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="bg-white px-3 py-2.5">
                      <p className="text-xs font-bold text-gray-900 leading-tight line-clamp-1">
                        {cat.name}
                      </p>
                      <p className="text-[10px] font-semibold text-brand-600 mt-0.5">
                        Shop Now →
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <ProductRail 
              title="Featured Products"  
              items={featuredProducts} 
              onAddToCart={handleAddToCart}
              onViewAll={<button onClick={() => handleViewAll("featured")} className="text-sm font-bold text-brand-600 hover:text-brand-700">View all →</button>}
            />
            <ProductRail 
              title="Best Sellers"  
              items={bestSellers} 
              onAddToCart={handleAddToCart}
              onViewAll={<button onClick={() => handleViewAll("best-sellers")} className="text-sm font-bold text-brand-600 hover:text-brand-700">View all →</button>}
            />
            
          </>
        )}

        <section id="catalog" className="py-6 sm:py-8">
          {sectionProducts ? (
            <>
              <ResultsSummary
                count={sectionProducts.length}
                searchQuery={routeSection || ""}
                selectedCategory={selectedCategory}
                sortOrder={sortOrder}
                minRating={minRating}
              />

              {sectionProducts.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white py-16 text-center sm:py-24">
                  <p className="text-base font-black text-gray-800">No products found</p>
                  <p className="mb-6 mt-2 text-sm text-gray-500">Try adjusting your search or filters.</p>
                  <button
                    onClick={handleReset}
                    className="rounded-md bg-brand-500 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-600"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {sectionProducts.map((product, index) => (
                    <div key={`${product.id}-${index}`} className="relative">
                      <ProductCard product={product} onAddToCart={handleAddToCart} />
                      {flashId === product.id && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/25">
                          <span className="rounded-md bg-green-600 px-4 py-2 text-sm font-black text-white shadow-lg">
                            Added to cart
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : searchQuery ? (
            <>
              <ResultsSummary
                count={filteredProducts.length}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                sortOrder={sortOrder}
                minRating={minRating}
              />

              {filteredProducts.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white py-16 text-center sm:py-24">
                  <p className="text-base font-black text-gray-800">No products found</p>
                  <p className="mb-6 mt-2 text-sm text-gray-500">Try adjusting your search or filters.</p>
                  <button
                    onClick={handleReset}
                    className="rounded-md bg-brand-500 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-600"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {filteredProducts.map((product, index) => (
                    <div key={`${product.id}-${index}`} className="relative">
                      <ProductCard product={product} onAddToCart={handleAddToCart} />
                      {flashId === product.id && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/25">
                          <span className="rounded-md bg-green-600 px-4 py-2 text-sm font-black text-white shadow-lg">
                            Added to cart
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : selectedCategory !== "All" ? (
            <>
              <ResultsSummary
                count={filteredProducts.length}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                sortOrder={sortOrder}
                minRating={minRating}
              />

              {filteredProducts.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white py-16 text-center sm:py-24">
                  <p className="text-base font-black text-gray-800">No products found</p>
                  <p className="mb-6 mt-2 text-sm text-gray-500">Try adjusting your search or filters.</p>
                  <button
                    onClick={handleReset}
                    className="rounded-md bg-brand-500 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-600"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {filteredProducts.map((product, index) => (
                    <div key={`${product.id}-${index}`} className="relative">
                      <ProductCard product={product} onAddToCart={handleAddToCart} />
                      {flashId === product.id && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/25">
                          <span className="rounded-md bg-green-600 px-4 py-2 text-sm font-black text-white shadow-lg">
                            Added to cart
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-8">
              {categoryTiles.map((cat) => {
                const categoryProducts = filteredProducts.filter((p) => p.category === cat && p.inStock);
                if (categoryProducts.length === 0) return null;
                return (
                  <div key={cat} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">{cat}</h3>
                      <button
                        onClick={() => router.push({ pathname: "/", query: { category: cat } })}
                        className="text-sm font-bold text-brand-600 hover:text-brand-700"
                      >
                        View all →
                      </button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {categoryProducts.map((product) => (
                        <div key={product.id} className="relative flex-shrink-0 w-48 sm:w-56">
                          <ProductCard product={product} onAddToCart={handleAddToCart} />
                          {flashId === product.id && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/25">
                              <span className="rounded-md bg-green-600 px-4 py-2 text-sm font-black text-white shadow-lg">
                                Added to cart
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="grid gap-4 py-8 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 lg:col-span-2">
            <SectionHeader title="Shopping information" />
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition"
                  >
                    <span className="text-sm font-bold">{faq.question}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === index && (
                    <div className="px-4 pb-4">
                      <p className="text-xs leading-6 text-gray-500">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Brand Logos Section */}
        <section className="py-8 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h3 className="text-center text-lg font-bold text-gray-900 mb-6">Our Trusted Brands</h3>
            <div className="relative overflow-hidden">
              <div className="flex gap-5 animate-scroll">
                {brandLogos.map((brand) => (
                  <div key={brand.name} className="flex w-28 h-24 items-center justify-center">
                    <img src={brand.image} alt={brand.name} className="h-full w-full object-contain opacity-70 hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
    </>
  );
}

export default ProductsPage;
