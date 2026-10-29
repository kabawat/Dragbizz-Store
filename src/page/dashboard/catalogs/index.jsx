"use client";

import { getCatalogUrl } from "@dragorbit/core/domain";
import { CatalogsScreen } from "@dragorbit/features/catalogs";
import { SideDrawer, TableSkeleton } from "@dragorbit/ui";
import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CatalogDetailsDrawer from "@/components/catalog/CatalogDetailsDrawer";
import CatalogFormDrawer from "@/components/catalog/CatalogFormDrawer";
import { Button, EmptyState, Modal } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import useDebounce from "@/hooks/form/useDebounce";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useHotkeys } from "@/hooks/keyboard/useHotkeys";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import useApiResponse from "@/hooks/useApiResponse";
import catalogService from "@/service/retailer/catalog.service";
import { useAppSelector } from "@/store/hooks";
import { appendCatalogs, CATALOG_STATUSES } from "@/utils/catalog.util";
import { copyToClipboard } from "@/utils/clipboard";
import { pickStoreId } from "@/utils/store.util";

function CatalogsWorkspace({ stores }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filters, setFilters] = useState({
    status: "",
    cursor: null,
  });
  const { status } = filters;
  const [list, setList] = useState({
    loading: true,
    loadingMore: false,
    data: [],
    error: null,
    pagination: null,
  });
  const [dialog, setDialog] = useState(null);
  const [detail, setDetail] = useState({
    data: null,
    error: null,
    loading: true,
  });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const searchInputRef = useRef(null);
  const deleting = useRef(false);
  const fetchingMore = useRef(false);
  const { showSuccess, showError } = useGlobalToast();
  const { execute: readList } = useApiResponse();
  const { execute: readDetail } = useApiResponse();
  const { execute: mutate, loading: deletingCatalog } = useApiResponse();
  const refresh = () =>
    setFilters((previous) => ({ ...previous, cursor: null }));
  const storeNames = new Map(
    stores.map((store) => [pickStoreId(store), store.storeName || store.name])
  );
  const detailRequest = dialog?.request;
  const detailId = detailRequest?.id;

  useEffect(() => {
    if (search !== debouncedSearch) return;
    let active = true;
    const { status, cursor } = filters;
    fetchingMore.current = !!cursor;
    setList((previous) =>
      cursor
        ? { ...previous, loadingMore: true, error: null }
        : {
            loading: true,
            loadingMore: false,
            data: [],
            error: null,
            pagination: null,
          }
    );
    readList(
      catalogService.getCatalogs({
        limit: 20,
        ...(cursor && { nextCursor: cursor }),
        sortBy: "createdAt",
        sortOrder: "desc",
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
        ...(status && { status }),
      }),
      { showToast: false }
    ).then((result) => {
      if (!active) return;
      fetchingMore.current = false;
      if (result.success) {
        setList((previous) => ({
          loading: false,
          loadingMore: false,
          data: cursor
            ? appendCatalogs(previous.data, result.data)
            : result.data,
          error: null,
          pagination: result.pagination,
        }));
      } else {
        setList((previous) => ({
          ...previous,
          loading: false,
          loadingMore: false,
          error: result.message,
        }));
      }
    });
    return () => {
      active = false;
    };
  }, [search, debouncedSearch, filters, readList]);

  useEffect(() => {
    if (!detailRequest) return;
    let active = true;
    setDetail({ data: null, error: null, loading: true });
    readDetail(catalogService.getCatalog(detailRequest.id), {
      showToast: false,
    }).then((result) => {
      if (!active) return;
      setDetail({
        data: result.success ? result.data : null,
        error: result.success ? null : result.message,
        loading: false,
      });
    });
    return () => {
      active = false;
    };
  }, [detailRequest, readDetail]);

  const loadMore = () => {
    if (
      fetchingMore.current ||
      list.loading ||
      !list.pagination?.nextCursor ||
      dialog ||
      deleteTarget ||
      search !== debouncedSearch
    )
      return;
    fetchingMore.current = true;
    setFilters((previous) => ({
      ...previous,
      cursor: list.pagination.nextCursor,
    }));
  };
  const copyLink = async (catalog) => {
    const copied = await copyToClipboard(getCatalogUrl(catalog.subdomain));
    if (copied) showSuccess("Digital shop link copied");
    else showError("Couldn't copy the link. Please try again.");
  };

  const open = (catalog, mode) => {
    if (deleting.current) return;
    setDetail({ data: null, error: null, loading: true });
    setDialog({ request: { id: catalog.id }, mode });
  };
  const confirmDelete = (catalog) => {
    setDeleteError(null);
    setDeleteTarget(catalog);
  };
  const remove = async () => {
    if (deleting.current || !deleteTarget) return;
    deleting.current = true;
    setDeleteError(null);
    const result = await mutate(catalogService.deleteCatalog(deleteTarget.id));
    deleting.current = false;
    if (result.success) {
      setDeleteTarget(null);
      if (detailId === deleteTarget.id) setDialog(null);
      refresh();
    } else {
      setDeleteError(result.message);
    }
  };

  const shortcutsEnabled = !dialog && !deleteTarget && !deleting.current;
  useCommonHotkeys({
    onNew: shortcutsEnabled ? () => setDialog({ mode: "create" }) : undefined,
    onSearch: shortcutsEnabled
      ? () => {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        }
      : undefined,
  });
  useHotkeys(
    shortcutsEnabled &&
      !list.loading &&
      !list.loadingMore &&
      search === debouncedSearch
      ? { "alt+r": refresh }
      : {}
  );

  return (
    <>
      <CatalogsScreen
        model={{
          catalogs: list.data,
          pagination: list.pagination,
          loading: list.loading || search !== debouncedSearch,
          loadingMore: list.loadingMore,
          error: list.error,
          search,
          searchInputRef,
          status,
          statuses: CATALOG_STATUSES,
          storeNames,
          busy: deletingCatalog || !!dialog,
          onSearch: (value) => {
            setSearch(value);
            setFilters((previous) => ({
              ...previous,
              cursor: null,
            }));
          },
          onStatus: (value) => {
            setFilters((previous) => ({
              ...previous,
              status: value,
              cursor: null,
            }));
          },
          onLoadMore: loadMore,
          onCopyLink: copyLink,
          onRefresh: refresh,
          onCreate: () => setDialog({ mode: "create" }),
          onOpen: open,
          onDelete: confirmDelete,
        }}
      />
      {dialog?.mode === "create" && (
        <CatalogFormDrawer
          stores={stores}
          onClose={() => setDialog(null)}
          onSuccess={() => {
            setDialog(null);
            refresh();
          }}
        />
      )}
      {detailId && (detail.loading || detail.error) && (
        <SideDrawer
          isOpen
          onClose={() => setDialog(null)}
          title={
            dialog.mode === "edit"
              ? "Edit Digital Shop"
              : "Digital Shop details"
          }
          position="center"
          width="w-full sm:w-[560px]"
          autoHeight
          closeOnEscape
          draggable={false}
          resizable={false}
        >
          <div className="p-4 sm:p-6">
            {detail.loading ? (
              <TableSkeleton compact rows={4} label="Loading Digital Shop…" />
            ) : (
              <EmptyState
                type="error"
                title="Couldn't load Digital Shop"
                description={detail.error}
                actionButton={{
                  label: "Try again",
                  onClick: () => {
                    setDialog((previous) => ({
                      ...previous,
                      request: { ...previous.request },
                    }));
                  },
                }}
              />
            )}
          </div>
        </SideDrawer>
      )}
      {detailId &&
        !detail.loading &&
        !detail.error &&
        detail.data &&
        (dialog.mode === "edit" ? (
          <CatalogFormDrawer
            key={detailId}
            catalog={detail.data}
            stores={stores}
            onClose={() => setDialog(null)}
            onSuccess={() => {
              setDialog(null);
              refresh();
            }}
          />
        ) : (
          <CatalogDetailsDrawer
            catalog={detail.data}
            stores={stores}
            onClose={() => setDialog(null)}
            onEdit={() =>
              setDialog((previous) => ({ ...previous, mode: "edit" }))
            }
            onDelete={confirmDelete}
            onCopyLink={copyLink}
          />
        ))}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => {
          if (!deleting.current) setDeleteTarget(null);
        }}
        title="Delete Digital Shop?"
        closeOnOverlayClick={false}
        closeOnEscape={!deletingCatalog}
        showCloseButton={!deletingCatalog}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                if (!deleting.current) setDeleteTarget(null);
              }}
              disabled={deletingCatalog}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              leftIcon={Trash2}
              onClick={remove}
              loading={deletingCatalog}
            >
              Delete Digital Shop
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-[rgb(var(--color-text-secondary))]">
          <p>
            Delete
            <strong className="break-words text-[rgb(var(--color-text-primary))]">
              {deleteTarget?.name}
            </strong>
            ? It will be removed from your Digital Shop list. Linked Stores will
            remain available.
          </p>
          {deleteError && (
            <p role="alert" className="text-red-500">
              {deleteError}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}

export default function CatalogsPage() {
  useDashboardHeader("Digital Shop", "Manage Digital Shops across your Agency");
  const { agency, stores } = useAppSelector((state) => state.profile);
  const { isOwner, loading } = useModulePermissions("online_store");
  if (loading) return <TableSkeleton />;
  if (!isOwner)
    return (
      <EmptyState
        title="Owner access required"
        description="Only Agency owners can manage Digital Shops."
      />
    );
  return <CatalogsWorkspace key={agency?.agencyId} stores={stores} />;
}
