import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


export function PublishButton({ onPublish }: { onPublish: () => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 justify-center mb-2">
        <Badge className="bg-black text-white">X</Badge>
        <Badge className="bg-pink-500 text-white">IG</Badge>
        <Badge className="bg-black text-white">TikTok</Badge>
      </div>
      <Button 
        size="lg" 
        className="bg-green-600 hover:bg-green-700 font-bold"
        onClick={onPublish}
      >
        Approve & Blast to All
      </Button>
    </div>
  );
}