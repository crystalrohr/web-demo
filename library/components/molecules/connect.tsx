import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/atoms/drawer";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useState } from "react";

const Connect = () => {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const content = (
    <div className="space-y-4 py-4">
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eatomssmod,
        nisl nec ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl
        nisl sit amet nisl. Sed eatomssmod, nisl nec ultricies lacinia, nisl
        nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod,
        nisl nec ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl
        nisl sit amet nisl. Sed euismod, nisl nec ultricies lacinia, nisl nisl
        aliquam nisl, eget aliquam nisl nisl sit amet nisl.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod,
        nisl nec ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl
        nisl sit amet nisl. Sed euismod, nisl nec ultricies lacinia, nisl nisl
        aliquam nisl, eget aliquam nisl nisl sit amet nisl.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod,
        nisl nec ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl
        nisl sit amet nisl. Sed euismod, nisl nec ultricies lacinia, nisl nisl
        aliquam nisl, eget aliquam nisl nisl sit amet nisl.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod,
        nisl nec ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl
        nisl sit amet nisl. Sed euismod, nisl nec ultricies lacinia, nisl nisl
        aliquam nisl, eget aliquam nisl nisl sit amet nisl.
      </p>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            className="font-outfit font-[16px] bg-black text-[white] px-6 rounded-[32px] py-3.5"
            >
            Connect
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Select a network</DialogTitle>
          </DialogHeader>
          {content}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          className="font-outfit font-[16px] bg-black text-[white] px-6 rounded-[32px] py-3.5"
        >
          Connect
        </button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Select a network</DrawerTitle>
        </DrawerHeader>
        {/* <div className="px-4">{content}</div> */}
        <ScrollArea className="p-4 max-h-[60vh] overflow-auto">
          {content}
        </ScrollArea>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default Connect;
