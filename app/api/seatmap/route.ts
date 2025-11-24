import { NextRequest, NextResponse as res } from "next/server";

export async function GET(req: NextRequest) {
    return res.json({ msg: "Server is running" }, { status: 200 });
}

export async function POST(req: NextRequest) {
    const body = await req.json();

    const { originId, date, userIp, destinationId } = body;

    if (!originId || !date || !userIp || !destinationId) {
        return res.json({ msg: "Add All Necessary Data" }, { status: 400 });
    }

    const buses = await fetch("http://uat.etrav.in/BusHost/BusAPIService.svc/JSONService/Bus_SeatMap", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "Auth_Header": {
                "UserId": "sfdfddsffdsdfs",
                "Password": "dsfsfddfsfsd",
                "Request_Id": "Crossa",
                "IP_Address": "192.168.1.100",
                "IMEI_Number": "123456789"
            },
            "Boarding_Id": "97867",
            "Dropping_Id": "207687",
            "Bus_Key": "VeNH4LQ+cRb7bWSkJPCK0g1SDLmy3+W64CAysVrtuzR7WnIZyb4vO+lD/5oYq8XV1Zu2QNahaVc2JH9xrD/YDdAzBPMctEeWOgSIRfkvN8Fd2CtWZ48UT+4t9/dQuAaNJjC0vWJGDWFEiWb1UYMKloiuwXXSqDEFj4craR0v5EEXa8NwuC4M+rTDnvFHHEoTCcfoZgstjXGhhCeMlJZ943FG3kJINhfVC6f8iFEPpO8uotMFm7d4Ps2ToIQxu0Yp4othfj70aVpa/3XZRxQCq3P0L5c8zDwRKIESHyM+CGzc3Sn8h7P7i0wTn9zLT5JT9DEUDUjkBcvCqgT2bTCZ9U4SIySuPsCWP7F8rtnswRIr/t73DhX7RZV3swJ0Vv/VQTtUfbxrGdpNC1CXQ81BA2x1TIwLAd4y+c6x5eA6pEoVQA3PHyUTz/5LKnVbgywi9tyGYJ+xEHz5edsmsmEbFccbuW/LVA2OXM0FH8hy1tc0tQ0GdsS2AWyKBxkamNQ0+85pVYX5X3ULfQpWrIHW2AexGldEZC7iutUIvKDw7Wco/pmpLOuBMHi/VWxdCvVvwpOPg3Gr27JIL78hb8yYtkNKheICtnTFqqu9zoQVYR9ZX+we0uYdHHTza5RJFDb1M2XRVi6vZUpZYiC+qTrPmF8Xu5itOGEkaSrQQDAbsMB+NIXep1HUjZHG/UuXSxHW5DzPbDLCxlSqIp2bwTG/i9VMyytAHf7It8+CzDpvAMu+WUUGBlik12uScZzdnFKJOOmHffg3VAZFZVv9e3BcsxbMgx/hxbFh8UJUVspphar2FttUdUpaQMCEnq8JqRsLvRafum/rh5ijaOj8ZgSrovspqueWg3fRRwV5+IXb3tQkiEERqI+84nPpYVF7Tg6SfHHFz376yaYe1rKXA4GlXA==",
            "Search_Key": "08LGd8MznrhwP+ToEdTgeKCRhrJfFZ2q/rJz034GjDkYPi39dUXQ6letvUzhu+26rnvcPzwmYTASQalN6o4DN99TtVpuDugxXT7BD6AidOteNBb0xDvY5mcVtP4JIZRgFWj6PhKtN0qBekIuWVwSsDE49Rz0vTOGTeBJPPZ6Q1BjUmgc7ehZHnjlGGxW8wAV4tpENOlkJeI3y8Zp2L3ySrZlOHl/5g5SLe8bgIPZuokkiq0qM49W3odLGUIsAkm8U2ZkL/JdjwfZvl8hwVAYZOdgEcLjK1Awgelo1v+pG8FTP1+L9u93EwqpsW64QzviMyL4khfdYrdngAZGPNlQ7svyzO06FUn7VYz3RM4ej99SyvZENvTI3UIbv/Go83St3gKdL8zhOF9l7Fqh/0Hjjg=="
        }),
    });

    const data = await buses.json();

    return res.json({ msg: "Success", data }, { status: 200 });
}
