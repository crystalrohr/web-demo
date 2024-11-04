"use client";

import React, { useState } from "react";

import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/atoms/drawer";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { useMediaQuery } from "@/hooks/use-media-query";

// Types for our props and configurations
type Page = {
  id: string;
  title: string;
  component: React.ComponentType<PageProps>;
};

type Action = {
  id: string;
  label: string;
  onClick: (context: any) => void;
};

type PageProps = {
  onClose: () => void;
  onNavigate: (pageId: string) => void;
  context: any;
  updateContext: (newContext: any) => void;
};

type AdaptiveModalProps = {
  trigger?: React.ReactNode;
  initialPage?: string;
  pages?: Page[];
  actions?: Action[];
  title?: string;
  className?: string;
  context?: any;
  onClose?: () => void;
  onContextChange?: (context: any) => void;
};

const AdaptiveModal = ({
  trigger,
  initialPage,
  pages = [],
  actions = [],
  title = "",
  className = "",
  context: initialContext = {},
  onClose,
  onContextChange,
}: AdaptiveModalProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState(false);
  const [currentPageId, setCurrentPageId] = useState(
    initialPage || pages[0]?.id || ""
  );
  const [context, setContext] = useState(initialContext);

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const updateContext = (newContext: any) => {
    const updatedContext = { ...context, ...newContext };
    setContext(updatedContext);
    onContextChange?.(updatedContext);
  };

  const currentPage = pages.find((page) => page.id === currentPageId);

  const Content = () => {
    // If we have pages, render the current page
    if (pages.length > 0 && currentPage) {
      const PageComponent = currentPage.component;
      return (
        <PageComponent
          onClose={handleClose}
          onNavigate={setCurrentPageId}
          context={context}
          updateContext={updateContext}
        />
      );
    }

    // If we only have actions, render them as buttons
    if (actions.length > 0) {
      return (
        <div className="flex flex-col gap-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              onClick={() => {
                action.onClick(context);
                handleClose();
              }}
              className="w-full"
            >
              {action.label}
            </Button>
          ))}
        </div>
      );
    }

    return null;
  };

  const modalContent = (
    <>
      <ScrollArea className="max-h-[60vh] overflow-auto">
        <div className="p-4">
          <Content />
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <Button variant="outline" onClick={handleClose} className="w-full">
          Close
        </Button>
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || <Button>Open</Button>}
        </DialogTrigger>
        <DialogContent className={`sm:max-w-[500px] ${className}`}>
          <DialogHeader>
            <DialogTitle>{currentPage?.title || title}</DialogTitle>
          </DialogHeader>
          {modalContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger || <Button>Open</Button>}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{currentPage?.title || title}</DrawerTitle>
        </DrawerHeader>
        {modalContent}
      </DrawerContent>
    </Drawer>
  );
};

export default AdaptiveModal;
