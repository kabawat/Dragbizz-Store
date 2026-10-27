"use client";
import { CashbookSettingsView } from "@dragorbit/features/settings";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { useAppSelector } from "@/store/hooks";
import { cashbookService } from "@/service/retailer/cashbook.service";

function StoreCashbookSettings({ storeId, storeName }) {
	const { t } = useTranslation();
	const { execute } = useApiResponse();
	const [settings, setSettings] = useState(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [openingDate, setOpeningDate] = useState(() =>
		new Intl.DateTimeFormat("en-CA", {
			timeZone: "Asia/Kolkata",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).format(new Date()),
	);
	const [openingAmount, setOpeningAmount] = useState("");
	const [openingSaving, setOpeningSaving] = useState(false);
	const [openingError, setOpeningError] = useState("");
	const requestId = useRef(0);
	const savingRef = useRef(false);
	const openingRef = useRef(false);
	const load = useCallback(async () => {
		const current = ++requestId.current;
		setLoading(true);
		setError("");
		const result = await execute(cashbookService.getSettings(storeId), {
			showToast: false,
		});
		if (requestId.current !== current) return;
		if (result?.success) setSettings(result.data);
		else setError(result?.message || t("cashbook.settings.loadFailed"));
		setLoading(false);
	}, [execute, storeId, t]);
	useEffect(() => {
		load();
		return () => {
			requestId.current++;
		};
	}, [load]);
	const onSave = async (event) => {
		event.preventDefault();
		if (savingRef.current) return;
		const maxAmount = Number(settings.maxAmount);
		if (
			!Number.isFinite(maxAmount) ||
			maxAmount < 0.01 ||
			maxAmount > 100000000
		) {
			setError(t("cashbook.settings.invalidLimit"));
			return;
		}
		savingRef.current = true;
		setSaving(true);
		setError("");
		try {
			const result = await execute(
				cashbookService.updateSettings(storeId, { ...settings, maxAmount }),
			);
			if (result?.success) setSettings(result.data);
			else setError(result?.message || t("cashbook.saveFailed"));
		} finally {
			savingRef.current = false;
			setSaving(false);
		}
	};
	const onSaveOpening = async (event) => {
		event.preventDefault();
		if (
			openingRef.current ||
			!openingDate ||
			openingAmount === "" ||
			!Number.isFinite(Number(openingAmount))
		)
			return;
		openingRef.current = true;
		setOpeningSaving(true);
		setOpeningError("");
		try {
			const result = await execute(
				cashbookService.setOpeningBalance(
					storeId,
					openingDate,
					Number(openingAmount),
				),
			);
			if (!result?.success)
				setOpeningError(result?.message || t("cashbook.saveFailed"));
		} finally {
			openingRef.current = false;
			setOpeningSaving(false);
		}
	};
	return (
		<CashbookSettingsView
			{...{
				t,
				storeName,
				settings,
				setSettings,
				loading,
				saving,
				error,
				onSave,
				openingDate,
				setOpeningDate,
				openingAmount,
				setOpeningAmount,
				openingSaving,
				openingError,
				onSaveOpening,
			}}
			onRetry={load}
		/>
	);
}
export default function CashbookSettings() {
	const { selectedStore, authProfile } = useAppSelector(
		(state) => state.profile,
	);
	const { t } = useTranslation();
	if (authProfile?.role !== "store_owner")
		return <p className="p-6 text-sm">{t("cashbook.settings.ownerOnly")}</p>;
	if (!selectedStore?.storeId)
		return <p className="p-6 text-sm">{t("cashbook.storeRequired")}</p>;
	return (
		<StoreCashbookSettings
			key={selectedStore.storeId}
			storeId={selectedStore.storeId}
			storeName={selectedStore.name || ""}
		/>
	);
}
