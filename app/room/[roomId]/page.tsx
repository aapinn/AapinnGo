import { redirect } from "next/navigation";

export default function RoomRootPage({
  params,
}: {
  params: { roomId: string };
}) {
  redirect(`/room/${params.roomId}/order`);
}
