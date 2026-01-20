"use client";
import { useEffect, useState } from "react";
import PackageCard from "@/components/package/PackageCard";
import { Loading } from "@/components/ui";
import { packageService } from "@/service";

const PricingSection = ({
  title = "Choose Your Plan",
  description = "Select the perfect plan for your business needs",
  packages: defaultPackages = [],
}) => {
  const [packages, setPackages] = useState(defaultPackages);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await packageService.getPackages({
          status: "ACTIVE",
          isVisible: true,
          sortBy: "displayOrder",
          sortOrder: "asc",
          limit: 10,
        });

        if (response.success && response.data) {
          const packagesData = Array.isArray(response.data)
            ? response.data
            : [];

          if (packagesData.length > 0) {
            setPackages(packagesData);
          } else {
            setPackages(defaultPackages);
          }
        } else {
          setPackages(defaultPackages);
        }
      } catch (err) {
        setError(err.message);
        setPackages(defaultPackages);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if no default packages provided
    if (defaultPackages.length === 0) {
      fetchPackages();
    } else {
      setLoading(false);
    }
  }, [defaultPackages.length, defaultPackages]);

  if (loading) {
    return (
      <section
        id="pricing"
        className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden"
      >
        <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loading />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="pricing"
      className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10" />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-[rgb(var(--color-text-primary))]">
            {title}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[rgb(var(--color-text-secondary))] max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id || pkg._id}
              pkg={pkg}
              buttonText="Buy now"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
